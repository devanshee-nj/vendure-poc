import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
    ActiveOrderService,
    Allow,
    Ctx,
    isGraphQlErrorResult,
    OrderService,
    Permission,
    RequestContext,
    Transaction,
    UserInputError,
} from '@vendure/core';
import gql from 'graphql-tag';
import { validateConfigSku } from './constants';
import { DesignProductService } from './design-product.service';
import { StorefrontCouponService } from './storefront-coupon.service';

export const shopApiExtensions = gql`
    input CartProductInput {
        name: String!
        description: String
        imageUrl: String
        "Design reference, e.g. CLRN349. Defaults to the part of the SKU before the first underscore."
        designRef: String
        category: String
        subCategory: String
        ornamentType: String
    }

    input CartPricingInput {
        "Unit price actually charged, including VAT, in major units, e.g. 1258.85"
        price: Float!
        "Unit price before discount, including VAT"
        listPrice: Float
        "Optional; must match the shop currency"
        currency: String
        "Discount per unit, including VAT. Used when listPrice is not sent."
        discountAmount: Float
        """
        Coupon code the discount came from. It is applied to the order (and created as a
        Vendure promotion on first use) so the discount shows in the cart.
        """
        promotionCode: String
        "Name of the promotion shown in the cart, e.g. 10% off rings"
        promotionDescription: String
        "e.g. 0.19 for 19% VAT"
        taxRate: Float
        taxAmount: Float
    }

    input SelectedOptionInput {
        featureId: String
        name: String!
        valueCode: String
        value: String!
    }

    input AddToCartInput {
        "Configured SKU, e.g. CLRN349_MS01MT0114MFCT03ST0006SF0202000000"
        sku: String!
        "Product slug, e.g. clrn349_01"
        slug: String!
        quantity: Int!
        "Storefront language, e.g. de"
        language: String
        product: CartProductInput!
        pricing: CartPricingInput!
        selectedOptions: [SelectedOptionInput!]
        "Any extra data to keep with the cart line"
        metadata: JSON
    }

    extend type Mutation {
        """
        Adds a configured design to the active order using only the data sent by the storefront.
        The design's Product/Variant is created on first use.
        """
        addConfiguredItemToOrder(input: AddToCartInput!): UpdateOrderItemsResult!
    }
`;

interface AddToCartInput {
    sku: string;
    slug: string;
    quantity: number;
    language?: string | null;
    product: {
        name: string;
        description?: string | null;
        imageUrl?: string | null;
        designRef?: string | null;
        [key: string]: unknown;
    };
    pricing: {
        price: number;
        listPrice?: number | null;
        currency?: string | null;
        discountAmount?: number | null;
        promotionCode?: string | null;
        promotionDescription?: string | null;
        [key: string]: unknown;
    };
    selectedOptions?: unknown[] | null;
    metadata?: unknown;
}

const json = (value: unknown) => (value == null ? null : JSON.stringify(value));

@Resolver()
export class ConfiguredCartResolver {
    constructor(
        private activeOrderService: ActiveOrderService,
        private orderService: OrderService,
        private designProductService: DesignProductService,
        private storefrontCouponService: StorefrontCouponService,
    ) {}

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateOrder, Permission.Owner)
    async addConfiguredItemToOrder(@Ctx() ctx: RequestContext, @Args() { input }: { input: AddToCartInput }) {
        const sku = input.sku.trim();
        const invalid = validateConfigSku(sku, input.product.designRef ? `${input.product.designRef}_` : sku);
        if (invalid) {
            throw new UserInputError(invalid);
        }
        const { pricing } = input;
        if (!(pricing.price > 0)) {
            throw new UserInputError('pricing.price must be greater than 0');
        }
        if (pricing.currency && pricing.currency !== ctx.currencyCode) {
            throw new UserInputError(`pricing.currency ${pricing.currency} does not match the shop currency ${ctx.currencyCode}`);
        }
        // NOTE: prices and discounts are trusted as sent by the storefront.
        const price = Math.round(pricing.price * 100);
        const couponCode = pricing.promotionCode?.trim() || null;
        // With a coupon code the line is priced at the list price and the coupon's promotion takes
        // off the discount, so the cart shows the discount and code instead of a lower unit price.
        const listPrice = couponCode
            ? Math.round((pricing.listPrice ?? pricing.price + (pricing.discountAmount ?? 0)) * 100)
            : price;
        if (listPrice < price) {
            throw new UserInputError('pricing.listPrice must not be lower than pricing.price');
        }

        const variantId = await this.designProductService.findOrCreateVariantId(ctx, {
            sku,
            slug: input.slug,
            name: input.product.name,
            description: input.product.description ?? '',
            price: listPrice,
        });
        if (couponCode) {
            await this.storefrontCouponService.ensurePromotion(ctx, couponCode, pricing.promotionDescription);
        }
        const order = await this.activeOrderService.getActiveOrder(ctx, undefined, true);
        const result = await this.orderService.addItemToOrder(ctx, order.id, variantId, input.quantity, {
            configSku: sku,
            slug: input.slug,
            language: input.language ?? null,
            productName: input.product.name,
            imageUrl: input.product.imageUrl ?? null,
            productDetails: json(input.product),
            pricing: json(pricing),
            selectedOptions: json(input.selectedOptions),
            metadata: json(input.metadata),
            configPrice: listPrice,
            promotionCode: couponCode,
            unitDiscount: listPrice - price,
        });
        if (!couponCode || isGraphQlErrorResult(result)) {
            return result;
        }
        const withCoupon = await this.orderService.applyCouponCode(ctx, result.id, couponCode);
        if (isGraphQlErrorResult(withCoupon)) {
            // Rolls back the whole mutation, so the line is not left in the cart without its discount.
            throw new UserInputError(withCoupon.message);
        }
        return withCoupon;
    }
}
