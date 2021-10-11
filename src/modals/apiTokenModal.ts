import { App, Modal } from "obsidian";
import type { TokenManager } from "~/store/tokenManager";
import ApiTokenModalContent from "./apiTokenModal.svelte";

export default class ApiTokenModal extends Modal {
    public waitForClose: Promise<void>;
    private resolvePromise: () => void;
    private modalContent: ApiTokenModalContent;
    private tokenManager: TokenManager;

    constructor(app: App, tokenManager: TokenManager) {
        super(app);

        this.tokenManager = tokenManager;
        this.waitForClose = new Promise(
            (resolve) => (this.resolvePromise = resolve)
        );

        this.titleEl.innerText = "Enter Hypothesis API token";

        this.modalContent = new ApiTokenModalContent({
            target: this.contentEl,
            props: {
                onSubmit: async (value: string) => {
                    await this.tokenManager.setToken(value);
                    this.close();
                },
            },
        });

        this.open();
    }

    onClose() {
        super.onClose();
        this.modalContent.$destroy();
        this.resolvePromise();
    }
}