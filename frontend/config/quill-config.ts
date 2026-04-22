import Quill from "quill";
import hljs from "highlight.js";
import QuillBetterTable from "quill-better-table";
import { ImageResize } from "quill-image-resize-module-ts";

let icons: any = Quill.import("ui/icons");
icons["custom-code"] =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-code-2"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m5 12-3 3 3 3"/><path d="m9 18 3-3-3-3"/></svg>';
icons[
  "image-url"
] = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
icons[
  "insert-table"
] = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`;
hljs.configure({
  languages: ["html", "css", "javascript", "php", "python", "typescript"],
});

Quill.register({ "modules/better-table": QuillBetterTable }, true);
Quill.register("modules/imageResize", ImageResize);

export const QuillConfig = {
  syntax: { hljs },
  toolbar: {
    container: [
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["blockquote", "code-block"],
      ["link", "image", "image-url", "video", "formula"],
      ["insert-table"],

      [{ header: [2, 3, 4, false] }],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
      [{ direction: "rtl" }], // text direction

      [{ size: ["small", false, "large", "huge"] }], // custom dropdown
      [
        {
          color: [
            "#000000",
            "#e60000",
            "#ff9900",
            "#ffff00",
            "#008a00",
            "#0066cc",
            "#9933ff",
            "#358671",
            "#f58634",
          ],
        },
        {
          background: [
            "#ffffff",
            "#e60000",
            "#ff9900",
            "#ffff00",
            "#008a00",
            "#0066cc",
            "#9933ff",
            "#358671",
            "#f58634",
          ],
        },
      ], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],

      ["clean", "custom-code"], // remove formatting button
    ],
    handlers: {
      "custom-code": function (this: any) {
        const editorInstance = this.quill;
        if (!editorInstance) return;

        const tool = document.querySelector(".ql-custom-code");
        const isActive = tool?.classList.contains("active");

        if (isActive) {
          tool?.classList.remove("active");
          const data = editorInstance.getText();
          const delta = editorInstance.clipboard.convert({ html: data });

          editorInstance.setContents(delta, "silent");

          return;
        }

        tool?.classList.add("active");
        const data = editorInstance.root.innerHTML;
        editorInstance.setText(data);

        return;
      },
      "insert-table": function (this: any) {
        const quill = this.quill;
        const tableModule = quill.getModule("better-table");
        if (!tableModule) return;

        // Remove existing popup if any
        const existingPopup = document.querySelector(".table-insert-popup");
        if (existingPopup) {
          existingPopup.remove();
          return;
        }

        // Create popup
        const popup = document.createElement("div");
        popup.className = "table-insert-popup";
        popup.innerHTML = `
          <div class="table-popup-content">
            <div class="table-popup-header">Chèn bảng</div>
            <div class="table-popup-body">
              <div class="table-popup-field">
                <label>Số hàng:</label>
                <input type="number" id="table-rows" value="3" min="1" max="20" />
              </div>
              <div class="table-popup-field">
                <label>Số cột:</label>
                <input type="number" id="table-cols" value="3" min="1" max="10" />
              </div>
            </div>
            <div class="table-popup-footer">
              <button class="table-popup-cancel">Huỷ</button>
              <button class="table-popup-insert">Chèn</button>
            </div>
          </div>
        `;

        // Style the popup
        popup.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        `;

        const content = popup.querySelector(".table-popup-content") as HTMLElement;
        if (content) {
          content.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 16px;
            min-width: 280px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          `;
        }

        const header = popup.querySelector(".table-popup-header") as HTMLElement;
        if (header) {
          header.style.cssText = `
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 16px;
            color: #333;
          `;
        }

        const fields = popup.querySelectorAll(".table-popup-field") as NodeListOf<HTMLElement>;
        fields.forEach((field) => {
          field.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          `;
          const label = field.querySelector("label") as HTMLElement;
          if (label) {
            label.style.cssText = `font-size: 14px; color: #555;`;
          }
          const input = field.querySelector("input") as HTMLElement;
          if (input) {
            input.style.cssText = `
              width: 80px;
              padding: 6px 10px;
              border: 1px solid #ccc;
              border-radius: 4px;
              font-size: 14px;
            `;
          }
        });

        const footer = popup.querySelector(".table-popup-footer") as HTMLElement;
        if (footer) {
          footer.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
          `;
        }

        const cancelBtn = popup.querySelector(".table-popup-cancel") as HTMLElement;
        if (cancelBtn) {
          cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #ccc;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          `;
        }

        const insertBtn = popup.querySelector(".table-popup-insert") as HTMLElement;
        if (insertBtn) {
          insertBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            background: #0066cc;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          `;
        }

        document.body.appendChild(popup);

        // Handle cancel
        cancelBtn?.addEventListener("click", () => {
          popup.remove();
        });

        // Handle backdrop click
        popup.addEventListener("click", (e) => {
          if (e.target === popup) {
            popup.remove();
          }
        });

        // Handle insert
        insertBtn?.addEventListener("click", () => {
          const rowsInput = document.getElementById("table-rows") as HTMLInputElement;
          const colsInput = document.getElementById("table-cols") as HTMLInputElement;
          const rows = parseInt(rowsInput?.value || "3", 10);
          const cols = parseInt(colsInput?.value || "3", 10);

          if (rows > 0 && cols > 0) {
            tableModule.insertTable(rows, cols);
          }
          popup.remove();
        });

        // Focus on rows input
        const rowsInput = document.getElementById("table-rows") as HTMLInputElement;
        rowsInput?.focus();
        rowsInput?.select();
      },
    },
  },
  clipboard: {
    matchVisual: false,
  },
  table: false, // disable table module
  "better-table": {
    operationMenu: {
      items: {
        unmergeCells: {
          text: "Another unmerge cells name",
        },
      },
    },
  },
  keyboard: {
    bindings: QuillBetterTable.keyboardBindings,
  },
  imageResize: {
    modules: ["Resize", "DisplaySize"],
  },
};
