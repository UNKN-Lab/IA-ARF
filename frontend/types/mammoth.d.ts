declare module "mammoth" {
    interface ConversionResult {
        value: string;
        messages: Array<{
            type: string;
            message: string;
        }>;
    }

    interface ConversionOptions {
        styleMap?: string[];
        includeDefaultStyleMap?: boolean;
        convertImage?: {
            (image: { readAsArrayBuffer(): Promise<ArrayBuffer> }): Promise<{ src: string } | null>;
        };
    }

    interface Input {
        arrayBuffer: ArrayBuffer;
    }

    export function convertToHtml(
        input: Input,
        options?: ConversionOptions
    ): Promise<ConversionResult>;

    export function extractRawText(
        input: Input,
        options?: ConversionOptions
    ): Promise<ConversionResult>;
}
