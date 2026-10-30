import { Injectable } from '@nestjs/common';
import { normalizeString } from '@vendure/common/lib/normalize-string';
import {
    Facet,
    FacetService,
    FacetValue,
    FacetValueService,
    ID,
    LanguageCode,
    Product,
    ProductService,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';

export interface DesignCategories {
    category?: string | null;
    subCategory?: string | null;
    ornamentType?: string | null;
}

/** The add-to-cart payload fields that become Facets, so products can be filtered and promoted by them. */
const CATEGORY_FACETS: Array<{ key: keyof DesignCategories; code: string; name: string }> = [
    { key: 'category', code: 'category', name: 'Category' },
    { key: 'subCategory', code: 'sub-category', name: 'Sub-category' },
    { key: 'ornamentType', code: 'ornament-type', name: 'Ornament type' },
];

/**
 * Categorizes design products with Facets. The Facets and their values are created on first use from
 * the storefront payload. A product only gets a value for a facet it has no value for yet, so a
 * category assigned in the Dashboard is never overwritten by the storefront.
 * Built-in promotions ("Discount products with these facets by x%") then work per category.
 */
@Injectable()
export class DesignCategoryService {
    constructor(
        private connection: TransactionalConnection,
        private facetService: FacetService,
        private facetValueService: FacetValueService,
        private productService: ProductService,
    ) {}

    async assignFromPayload(ctx: RequestContext, productId: ID, categories: DesignCategories): Promise<void> {
        const product = await this.connection.getEntityOrThrow(ctx, Product, productId, {
            relations: ['facetValues', 'facetValues.facet'],
        });
        const facetValueIds = product.facetValues.map(fv => fv.id);
        for (const { key, code, name } of CATEGORY_FACETS) {
            const value = categories[key]?.trim();
            if (!value || product.facetValues.some(fv => fv.facet.code === code)) {
                continue;
            }
            const facetValue = await this.findOrCreateFacetValue(ctx, code, name, value);
            facetValueIds.push(facetValue.id);
        }
        if (facetValueIds.length > product.facetValues.length) {
            await this.productService.update(ctx, { id: productId, facetValueIds });
        }
    }

    private async findOrCreateFacetValue(ctx: RequestContext, facetCode: string, facetName: string, value: string): Promise<FacetValue> {
        const facet =
            (await this.facetService.findByCode(ctx, facetCode, ctx.languageCode)) ??
            (await this.facetService.create(ctx, {
                code: facetCode,
                isPrivate: false,
                translations: [{ languageCode: LanguageCode.en, name: facetName }],
            }));
        const code = normalizeString(value, '-');
        const existing = await this.connection.getRepository(ctx, FacetValue).findOne({
            where: { code, facet: { id: facet.id } },
        });
        if (existing) {
            return existing;
        }
        const languageCodes = [...new Set([ctx.channel.defaultLanguageCode, ctx.languageCode])];
        return this.facetValueService.create(ctx, facet as Facet, {
            facetId: facet.id,
            code,
            translations: languageCodes.map(languageCode => ({ languageCode, name: value })),
        });
    }
}
