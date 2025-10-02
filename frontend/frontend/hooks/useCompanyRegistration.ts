import { useEffect, useState } from "react";
import { isCompanyRegistered } from "@/utils/payroll";

export function useCompanyRegistration(companyAddress?: string | null) {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  async function refresh(addr?: string | null) {
    const a = (addr ?? companyAddress) || "";
    if (!a) { setRegistered(false); return false; }
    setLoading(true);
    try {
      const ok = await isCompanyRegistered(a);
      setRegistered(!!ok);
      return !!ok;
    } catch {
      setRegistered(false);
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh(companyAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyAddress]);

  return { registered, loading, refresh };
}
