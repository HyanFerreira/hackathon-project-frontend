import axios from "axios";

type ApiErrorPayload = {
  message?: string;
};

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return (
      error.response?.data?.message ??
      "Não foi possível acessar a API. Confira se o backend está em execução."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado ao buscar os usuários.";
}
