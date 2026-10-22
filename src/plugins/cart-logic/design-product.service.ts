import { Injectable } from '@nestjs/common';
import { GlobalFlag } from '@vendure/common/lib/generated-types';
import {
    ID,
    Product,
    ProductService,
    ProductVariantService,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';
import { IsNull } from 'typeorm';
import { designRefOf } from './constants';

export interface DesignInput {
    sku: string;
    slug: string;
    name: string;
    description: string;
    /** Unit price in minor units, VAT included. */
    price: number;
}

/**
 * Vendure has no pre-loaded catalog. Order lines must point at a ProductVariant, so the first time
 * a design is added to a cart a minimal Product + Variant is created from the add-to-cart payload.
 * Every configuration of that design shares the variant; the configuration and its price live on
 * the order line.
 */
@Injectable()
export class DesignProductService {
    constructor(
        private connection: TransactionalConnection,
        private productService: ProductService,
        private variantService: ProductVariantService,
    ) {}

    async findOrCreateVariantId(ctx: RequestContext, input: DesignInput): Promise<ID> {
        const designRef = designRefOf(input.sku);
        const existing = await this.connection.getRepository(ctx, Product).findOne({
            where: { customFields: { designRef }, deletedAt: IsNull() } as any,
            relations: ['variants'],
        });
        const existingVariant = existing?.variants.find(v => !v.deletedAt);
        if (existingVariant) {
            return existingVariant.id;
        }

        const languageCodes = [...new Set([ctx.channel.defaultLanguageCode, ctx.languageCode])];
        const productId =
            existing?.id ??
            (
                await this.productService.create(ctx, {
                    enabled: true,
                    translations: languageCodes.map(languageCode => ({
                        languageCode,
                        name: input.name,
                        slug: input.slug.toLowerCase(),
                        description: input.description,
                    })),
                    customFields: { designRef },
                })
            ).id;
        const [variant] = await this.variantService.create(ctx, [
            {
                productId,
                sku: designRef,
                price: input.price,
                trackInventory: GlobalFlag.FALSE,
                translations: languageCodes.map(languageCode => ({ languageCode, name: input.name })),
            },
        ]);
        return variant.id;
    }
}
