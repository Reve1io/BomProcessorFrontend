import { exportExcelKP } from "./excel";

export function waitForBX(callback: () => void) {
    if ((window as any).BX) callback();
    else setTimeout(() => waitForBX(callback), 200);
}

export async function sendOfferToBitrix(data: any[]) {
    const modal = new window.BX.PopupWindow("offer_popup", null, {
        content: window.BX("offer-modal"),
        autoHide: false,
        closeByEsc: true,
        closeIcon: { right: "10px", top: "10px" },
        overlay: { backgroundColor: "black", opacity: 60 },
        titleBar: {
            content: window.BX.create("span", {
                html: "<b>Запрос КП</b>"
            })
        },
        width: 600
    });

    modal.show();

    const form = document.querySelector('#offer-modal form') as HTMLFormElement | null;

    if (!form) {
        console.warn("Форма не найдена");
        return;
    }

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const name = (form.querySelector('input[name="form_text_140"]') as HTMLInputElement)?.value;
        const email = (form.querySelector('input[name="form_email_141"]') as HTMLInputElement)?.value;
        const phone = (form.querySelector('textarea[name="form_text_142"]') as HTMLTextAreaElement)?.value;

        if (!name || !email) {
            alert("Заполните форму");
            return;
        }

        const excelBlob = exportExcelKP(data);
        if (!excelBlob) return;

        const payload = new FormData();
        payload.append("name", name);
        payload.append("email", email);
        payload.append("phone", phone);
        payload.append("file", excelBlob, "bom-list.xlsx");

        await fetch("/local/ajax/send_offer.php", {
            method: "POST",
            body: payload
        });
    }, { once: true });
}
