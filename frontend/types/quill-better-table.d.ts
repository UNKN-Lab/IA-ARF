declare module "quill-better-table" {
    import Quill from "quill";

    interface OperationMenuItem {
        text: string;
    }

    interface OperationMenuItems {
        unmergeCells?: OperationMenuItem;
        mergeCells?: OperationMenuItem;
        insertColumnRight?: OperationMenuItem;
        insertColumnLeft?: OperationMenuItem;
        insertRowUp?: OperationMenuItem;
        insertRowDown?: OperationMenuItem;
        deleteColumn?: OperationMenuItem;
        deleteRow?: OperationMenuItem;
        deleteTable?: OperationMenuItem;
    }

    interface OperationMenu {
        items?: OperationMenuItems;
        color?: {
            colors?: string[];
            text?: string;
        };
    }

    interface BetterTableOptions {
        operationMenu?: OperationMenu;
    }

    class QuillBetterTable {
        static keyboardBindings: Record<string, unknown>;
        constructor(quill: Quill, options?: BetterTableOptions);
    }

    export default QuillBetterTable;
}
