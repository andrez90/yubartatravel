import { createHash } from 'node:crypto';

/**
 * Wompi (Bancolombia): Web Checkout por redirección.
 * Requiere en el servidor: WOMPI_PUBLIC_KEY y WOMPI_INTEGRITY_SECRET (se crean en el panel de Wompi).
 * La firma de integridad es SHA-256 de: referencia + monto en centavos + moneda + secreto de integridad.
 * Verifica este formato con la documentación vigente de Wompi antes de salir a producción.
 */
export function wompiCheckoutUrl(opts: { reference: string; amountCop: number; redirectUrl: string }) {
  const pub = process.env.WOMPI_PUBLIC_KEY;
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!pub || !secret) return null;
  const cents = Math.round(opts.amountCop * 100);
  const signature = createHash('sha256').update(`${opts.reference}${cents}COP${secret}`).digest('hex');
  const q = new URLSearchParams({
    'public-key': pub,
    currency: 'COP',
    'amount-in-cents': String(cents),
    reference: opts.reference,
    'signature:integrity': signature,
    'redirect-url': opts.redirectUrl,
  });
  return `https://checkout.wompi.co/p/?${q.toString()}`;
}

export const paymentsConfiguredServer = () => Boolean(process.env.WOMPI_PUBLIC_KEY && process.env.WOMPI_INTEGRITY_SECRET);
