import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
	constructor({ document, onNavigate, store, localStorage }) {
		this.document = document;
		this.onNavigate = onNavigate;
		this.store = store;
		this.ErrorOnFile = false;
		const formNewBill = this.document.querySelector(
			`form[data-testid="form-new-bill"]`
		);
		formNewBill.addEventListener("submit", this.handleSubmit);
		const file = this.document.querySelector(`input[data-testid="file"]`);
		file.addEventListener("change", this.handleChangeFile);
		this.fileUrl = null;
		this.fileName = null;
		this.billId = null;
		new Logout({ document, localStorage, onNavigate });
	}
	handleChangeFile = (e) => {
		e.preventDefault();
		const file = this.document.querySelector(`input[data-testid="file"]`)
			.files[0];
		const filePath = e.target.value.split(/\\/g);
		const fileName = filePath[filePath.length - 1];
		const formData = new FormData();
		const email = JSON.parse(localStorage.getItem("user")).email;
		formData.append("email", email);
		const extension = fileName.substring(fileName.indexOf(".") + 1);
		let inputObject = document.getElementById("file-input");
		let errorMessageQuantityElement = document.createElement("div");
		errorMessageQuantityElement.setAttribute("id", "error-message-id");
		errorMessageQuantityElement.textContent =fileName+
			" n'est pas un fichier valide. Vous devez sélectionner un fichier de type image.";
		if (extension == "png" || extension == "jpg" || extension == "jpeg") {
			formData.append("file", file);
			this.ErrorOnFile = false;
      document.getElementById("error-message-id") && document.getElementById("error-message-id").remove();
		} else {
			inputObject.after(errorMessageQuantityElement);
			errorMessageQuantityElement.style.color = "red";
			this.ErrorOnFile = true;
		}
		this.store
			.bills()
			.create({
				data: formData,
				headers: {
					noContentType: true,
				},
			})
			.then(({ fileUrl, key }) => {
				console.log(fileUrl);
				this.billId = key;
				this.fileUrl = fileUrl;
				this.fileName = fileName;
			})
			.catch((error) => console.error(error));
	};
	handleSubmit = (e) => {
		e.preventDefault();
		if (!this.ErrorOnFile) {
			console.log(
				'e.target.querySelector(`input[data-testid="datepicker"]`).value',
				e.target.querySelector(`input[data-testid="datepicker"]`).value
			);
			const email = JSON.parse(localStorage.getItem("user")).email;
			const bill = {
				email,
				type: e.target.querySelector(`select[data-testid="expense-type"]`)
					.value,
				name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
				amount: parseInt(
					e.target.querySelector(`input[data-testid="amount"]`).value
				),
				date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
				vat: e.target.querySelector(`input[data-testid="vat"]`).value,
				pct:
					parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
					20,
				commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
					.value,
				fileUrl: this.fileUrl,
				fileName: this.fileName,
				status: "pending",
			};
			this.updateBill(bill);
			this.onNavigate(ROUTES_PATH["Bills"]);
		}
	};

	// not need to cover this function by tests
	updateBill = (bill) => {
		if (this.store) {
			this.store
				.bills()
				.update({ data: JSON.stringify(bill), selector: this.billId })
				.then(() => {
					this.onNavigate(ROUTES_PATH["Bills"]);
				})
				.catch((error) => console.error(error));
		}
	};
}
