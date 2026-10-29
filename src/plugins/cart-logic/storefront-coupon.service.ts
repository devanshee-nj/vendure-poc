import { Injectable } from '@nestjs/common';
import {
    isGraphQlErrorResult,
    Promotion,
    PromotionService,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';
import { IsNull, Raw } from 'typeorm';
import { STOREFRONT_DISCOUNT_ACTION } from './storefront-discount.action';

/**
 * Coupon codes are not set up in Vendure beforehand: the storefront sends the code and the discount
 * it applied with each add-to-cart. The first time a code is seen, a coupon Promotion using the
 * storefront discount action is created in the current channel, so the code shows up in the
 * Dashboard where it can be disabled, limited or given an end date.
 * A promotion that already exists with the code (e.g. created in the Dashboard) is used as it is.
 */
@Injectable()
export class StorefrontCouponService {
    constructor(
        private connection: TransactionalConnection,
        private promotionService: PromotionService,
    ) {}

    async ensurePromotion(ctx: RequestContext, couponCode: string, description?: string | null): Promise<void> {
        const existing = await this.connection.getRepository(ctx, Promotion).findOne({
            where: {
                couponCode: Raw(alias => `LOWER(${alias}) = LOWER(:couponCode)`, { couponCode }),
                deletedAt: IsNull(),
                channels: { id: ctx.channelId },
            },
            relations: ['channels'],
        });
        if (existing) {
            return;
        }
        const languageCodes = [...new Set([ctx.channel.defaultLanguageCode, ctx.languageCode])];
        const result = await this.promotionService.createPromotion(ctx, {
            enabled: true,
            couponCode,
            conditions: [],
            actions: [{ code: STOREFRONT_DISCOUNT_ACTION, arguments: [] }],
            translations: languageCodes.map(languageCode => ({
                languageCode,
                name: description?.trim() || couponCode,
                description: 'Created from the storefront add-to-cart payload',
            })),
        });
        if (isGraphQlErrorResult(result)) {
            throw new Error(`Could not create promotion for coupon ${couponCode}: ${result.message}`);
        }
    }
}
