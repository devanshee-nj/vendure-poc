import { CustomFieldConfig, LanguageCode, PluginCommonModule, VendurePlugin } from '@vendure/core';
import { CartRulesInterceptor } from './cart-rules.interceptor';
import { ConfigPriceStrategy } from './config-price.strategy';
import { ConfiguredCartResolver, shopApiExtensions } from './configured-cart.resolver';
import { DesignProductService } from './design-product.service';

const label = (value: string) => [{ languageCode: LanguageCode.en, value }];

// Set only by addConfiguredItemToOrder, so they are readonly in the GraphQL input types.
const lineField = (name: string, type: 'string' | 'text' | 'int', title: string): CustomFieldConfig =>
    ({ name, type, nullable: true, readonly: true, label: label(title) }) as CustomFieldConfig;

/**
 * Configurable jewellery cart logic. There is no pre-loaded catalog:
 * - addConfiguredItemToOrder(input) Shop API mutation takes SKU, product details, pricing and metadata from the storefront
 * - creates a minimal Product + Variant per design on first use
 * - stores the configuration, product details and price on each cart line (OrderLine custom fields)
 * - prices those lines with the price sent by the storefront
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [DesignProductService],
    shopApiExtensions: { schema: shopApiExtensions, resolvers: [ConfiguredCartResolver] },
    configuration: config => {
        config.orderOptions.orderItemPriceCalculationStrategy = new ConfigPriceStrategy();
        config.orderOptions.orderInterceptors.push(new CartRulesInterceptor());
        config.customFields.Product.push({
            name: 'designRef',
            type: 'string',
            nullable: true,
            label: label('Design ref'),
        });
        config.customFields.OrderLine.push(
            lineField('configSku', 'string', 'Configuration SKU'),
            lineField('slug', 'string', 'Product slug'),
            lineField('language', 'string', 'Language'),
            lineField('productName', 'string', 'Product name'),
            lineField('imageUrl', 'text', 'Image URL'),
            lineField('productDetails', 'text', 'Product details (JSON)'),
            lineField('pricing', 'text', 'Pricing (JSON)'),
            lineField('selectedOptions', 'text', 'Selected options (JSON)'),
            lineField('metadata', 'text', 'Metadata (JSON)'),
            lineField('configPrice', 'int', 'Unit price incl. VAT (minor units)'),
        );
        return config;
    },
    compatibility: '^3.0.0',
})
export class CartLogicPlugin {}
