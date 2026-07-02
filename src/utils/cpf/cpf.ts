export function onlyCpfDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatCpf(value: string) {
  const digits = onlyCpfDigits(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function isValidCpf(value: string) {
  const digits = onlyCpfDigits(value);

  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const calculateDigit = (size: number) => {
    const sum = digits
      .slice(0, size)
      .split("")
      .reduce(
        (acc, digit, index) => acc + Number(digit) * (size + 1 - index),
        0,
      );

    const remainder = (sum * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  };

  return (
    calculateDigit(9) === Number(digits[9]) &&
    calculateDigit(10) === Number(digits[10])
  );
}
