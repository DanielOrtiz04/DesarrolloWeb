export async function registrarAccion(mensaje) {
  await new Promise((resolve) => setTimeout(resolve, 10));
  console.log(`[LOG] ${new Date().toISOString()} - ${mensaje}`);
}
