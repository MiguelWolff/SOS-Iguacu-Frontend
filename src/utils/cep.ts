import type { ViaCepResponse } from '../types';

export const lookupCep = async (cepRaw: string): Promise<ViaCepResponse | null> => {
  const cep = cepRaw.replace(/[^0-9]/g, '');
  if (!cep || cep.length !== 8) return null;
  
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const json: ViaCepResponse = await res.json();
    if (json.erro) return null;
    return json;
  } catch {
    return null;
  }
};

