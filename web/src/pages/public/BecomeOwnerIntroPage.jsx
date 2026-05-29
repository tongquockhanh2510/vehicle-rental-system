import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Banknote, FileCheck2, Shield } from 'lucide-react';
import SectionHeader from '../../components/common/SectionHeader';
import { useAuth } from '../../context/AuthContext';
import { getOwnerCta } from '../../utils/ownerCta';

export default function BecomeOwnerIntroPage() {
  const { user, ownerStatus } = useAuth();
  const ownerCta = getOwnerCta(user, ownerStatus);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Trá»Ÿ thÃ nh chá»§ xe"
        subtitle="Má»Ÿ nguá»“n thu tá»« phÆ°Æ¡ng tiá»‡n nhÃ n rá»—i vá»›i quy trÃ¬nh xÃ¡c minh minh báº¡ch vÃ  bá»™ cÃ´ng cá»¥ quáº£n lÃ½ chuyÃªn nghiá»‡p."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
          <Banknote className="h-5 w-5 text-emerald-300" />
          <h3 className="mt-2 text-base font-semibold text-white">TÄƒng doanh thu</h3>
          <p className="mt-1 text-sm text-emerald-100">Theo dÃµi doanh thu, tá»· lá»‡ láº¥p Ä‘áº§y vÃ  gá»£i Ã½ giÃ¡ thuÃª theo thá»‹ trÆ°á»ng.</p>
        </article>

        <article className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4">
          <FileCheck2 className="h-5 w-5 text-cyan-300" />
          <h3 className="mt-2 text-base font-semibold text-white">Há»£p Ä‘á»“ng minh báº¡ch</h3>
          <p className="mt-1 text-sm text-cyan-100">Má»i giao dá»‹ch cÃ³ timeline há»£p Ä‘á»“ng, thanh toÃ¡n cá»c vÃ  quy trÃ¬nh kiá»ƒm tra xe rÃµ rÃ ng.</p>
        </article>

        <article className="rounded-2xl border border-blue-400/25 bg-blue-500/10 p-4">
          <Shield className="h-5 w-5 text-blue-300" />
          <h3 className="mt-2 text-base font-semibold text-white">An toÃ n váº­n hÃ nh</h3>
          <p className="mt-1 text-sm text-blue-100">Theo dÃµi vá»‹ trÃ­, cáº£nh bÃ¡o vÆ°á»£t pháº¡m vi vÃ  cÆ¡ cháº¿ giáº£i quyáº¿t tranh cháº¥p cÃ³ admin.</p>
        </article>
      </section>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <h3 className="text-lg font-semibold text-white">Quy trÃ¬nh owner onboarding</h3>
        <ol className="mt-3 space-y-2 text-sm text-slate-200">
          <li>1. Äiá»n thÃ´ng tin phÃ¡p lÃ½ vÃ  Ä‘á»‹nh danh.</li>
          <li>2. Cung cáº¥p thÃ´ng tin nháº­n tiá»n.</li>
          <li>3. Äá»“ng Ã½ Ä‘iá»u khoáº£n cho thuÃª vÃ  bá»“i thÆ°á»ng.</li>
          <li>4. Chá» admin duyá»‡t tráº¡ng thÃ¡i OWNER_APPROVED.</li>
        </ol>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={ownerCta.to} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">{ownerCta.label}</Link>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200">ÄÄƒng nháº­p <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}
