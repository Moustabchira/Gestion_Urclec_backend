import prismaClient from "../utils/prismaClient";

export async function generateCodeAgence(): Promise<string> {

  const lastAgence = await prismaClient.agence.findFirst({
    orderBy: { id: "desc" },
    select: { code_agence: true },
  });

  let nextNumber = 1;

  if (lastAgence?.code_agence) {

    const match = lastAgence.code_agence.match(/\d+$/);
    if (match) nextNumber = parseInt(match[0], 10) + 1;

  }

  return `AG${nextNumber.toString().padStart(3, "0")}`;
}
