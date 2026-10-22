import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
    ActiveOrderService,
    Allow,
    Ctx,
    OrderService,
    Permission,
    RequestContext,
    Transaction,
    UserInputError,
} from '@vendure/core';
import gql from 'graphql-tag';
import { validateConfigSku } from './constants';
import { DesignProductService } from './design-product.service';

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
        discountAmount: Float
        promotionCode: String
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
    pricing: { price: number; currency?: string | null; [key: string]: unknown };
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
        // NOTE: the price is trusted as sent by the storefront.
        const price = Math.round(pricing.price * 100);

        const variantId = await this.designProductService.findOrCreateVariantId(ctx, {
            sku,
            slug: input.slug,
            name: input.product.name,
            description: input.product.description ?? '',
            price,
        });
        const order = await this.activeOrderService.getActiveOrder(ctx, undefined, true);
        return this.orderService.addItemToOrder(ctx, order.id, variantId, input.quantity, {
            configSku: sku,
            slug: input.slug,
            language: input.language ?? null,
            productName: input.product.name,
            imageUrl: input.product.imageUrl ?? null,
            productDetails: json(input.product),
            pricing: json(pricing),
            selectedOptions: json(input.selectedOptions),
            metadata: json(input.metadata),
            configPrice: price,
        });
    }
}
