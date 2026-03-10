import axios from "axios";
import { useEffect, useState } from "react";

interface RegisterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onRegister: (username: string, email: string, password: string) => Promise<void>;
}

function RegisterModal({ isOpen, onClose, onRegister }: RegisterModalProps) {
	const [username, setUsername] = useState("");
    const [email, setEmail] = useState(""); 
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (isOpen) {
			setError("");
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const onEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		window.addEventListener("keydown", onEsc);
		return () => window.removeEventListener("keydown", onEsc);
	}, [isOpen, onClose]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const cleanUsername = username.trim();
		const cleanEmail = email.trim().toLowerCase();

		if (!cleanUsername) {
			setError("Ingresa un nombre de usuario");
			return;
		}

		if (!cleanEmail) {
			setError("Ingresa un correo electronico");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(cleanEmail)) {
			setError("Ingresa un correo electronico valido");
			return;
		}

		if (password.length < 4) {
			setError("La contrasena debe tener al menos 4 caracteres");
			return;
		}

		try {
			await onRegister(cleanUsername, cleanEmail, password);
			setUsername("");
			setEmail("");
			setPassword("");
			setError("");
		} catch (authError) {
			if (axios.isAxiosError(authError)) {
				const status = authError.response?.status;
				if (status === 409) {
					setError("La cuenta ya existe");
					return;
				}
			}

			setError("No se pudo registrar");
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="modal-backdrop" onClick={onClose}>
			<div
				className="modal-content"
				role="dialog"
				aria-modal="true"
				aria-label="Registrarse"
				onClick={(event) => event.stopPropagation()}
			>
				<h2>Registrarse</h2>
				<form className="login-form" onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="Usuario"
						value={username}
						onChange={(event) => {
							setUsername(event.target.value);
							setError("");
						}}
					/>
					<input
						type="email"
						placeholder="Correo electronico"
						value={email}
						onChange={(event) => {
							setEmail(event.target.value);
							setError("");
						}}
					/>
					<input
						type="password"
						placeholder="Contrasena"
						value={password}
						onChange={(event) => {
							setPassword(event.target.value);
							setError("");
						}}
					/>
					{error ? <p className="form-error">{error}</p> : null}
					<div className="modal-actions">
						<button type="button" onClick={onClose}>
							Cancelar
						</button>
						<button type="submit" className="registerButton">
							Registrarse
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default RegisterModal;
