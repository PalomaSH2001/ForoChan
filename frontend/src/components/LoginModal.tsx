import axios from "axios";
import { useEffect, useState } from "react";

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	onLogin: (username: string, password: string) => Promise<void>;
}

function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

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
		if (!cleanUsername) {
			setError("Ingresa un nombre de usuario");
			return;
		}

		if (password.length < 4) {
			setError("La contrasena debe tener al menos 4 caracteres");
			return;
		}

		try {
			await onLogin(cleanUsername, password);
			setUsername("");
			setPassword("");
			setError("");
		} catch (authError) {
			if (axios.isAxiosError(authError)) {
				const status = authError.response?.status;
				if (status === 404) {
					setError("La cuenta no existe");
					return;
				}

				if (status === 401) {
					setError("Contrasena incorrecta");
					return;
				}
			}

			setError("No se pudo iniciar sesion");
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
				aria-label="Iniciar sesion"
				onClick={(event) => event.stopPropagation()}
			>
				<h2>Iniciar sesion</h2>
				<form className="login-form" onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="Usuario"
						value={username}
						onChange={(event) => setUsername(event.target.value)}
					/>
					<input
						type="password"
						placeholder="Contrasena"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
					{error ? <p className="form-error">{error}</p> : null}
					<div className="modal-actions">
						<button type="button" onClick={onClose}>
							Cancelar
						</button>
						<button type="submit"className="loginButton">
							Entrar
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default LoginModal;
