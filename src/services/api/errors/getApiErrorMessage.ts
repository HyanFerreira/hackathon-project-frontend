import axios from "axios";

type ApiErrorPayload = {
  errors?: Record<string, string[]>;
  message?: string;
};

function translateApiErrorMessage(message: string, field?: string) {
  const fieldName = field === "cpf" ? "CPF" : "senha";

  if (message === `The ${field} field is required.`) {
    return `Informe ${field === "cpf" ? "o" : "a"} ${fieldName}.`;
  }

  if (message === "The cpf field must be 11 characters.") {
    return "Informe um CPF com 11 dígitos.";
  }

  return message;
}

export function getApiValidationErrors(error: unknown) {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return undefined;
  }

  const errors = error.response?.data?.errors;

  if (!errors) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      translateApiErrorMessage(messages[0] ?? "", field),
    ]),
  );
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const firstValidationError = Object.entries(
      error.response?.data?.errors ?? {},
    )[0];

    return (
      (firstValidationError &&
        translateApiErrorMessage(
          firstValidationError[1][0],
          firstValidationError[0],
        )) ??
      error.response?.data?.message ??
      "Não foi possível acessar a API. Confira se o backend está em execução."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado ao buscar os usuários.";
}
