import {
    Order,
    OrderInterceptor,
    RequestContext,
    WillAddItemToOrderInput,
    WillAdjustOrderLineInput,
} from '@vendure/core';
import { getConfigSku, validateConfigSku } from './constants';

/**
 * Runs before an item is added to / changed in the cart. Returning a string rejects the change
 * and the Shop API responds with an OrderInterceptorError containing that message.
 */
export class CartRulesInterceptor implements OrderInterceptor {
    willAddItemToOrder(ctx: RequestContext, order: Order, input: WillAddItemToOrderInput) {
        const configSku = getConfigSku(input.customFields as Record<string, any>);
        if (configSku) {
            return validateConfigSku(configSku, input.productVariant.sku);
        }
    }

    willAdjustOrderLine(ctx: RequestContext, order: Order, input: WillAdjustOrderLineInput) {
        const configSku = getConfigSku(input.customFields as Record<string, any>);
        if (configSku) {
            return validateConfigSku(configSku, input.orderLine.productVariant.sku);
        }
    }
}
