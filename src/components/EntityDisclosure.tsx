import { ENTITY } from "@/lib/entity";

export function EntityDisclosure() {
  return (
    <div className="mb-8 border-[1.5px] border-ink p-4 font-mono text-sm">
      <p>
        <strong>{ENTITY.brand}</strong> is a trade name operated by{" "}
        <strong>{ENTITY.legalName}</strong> ({ENTITY.legalNameJa}), a {ENTITY.entityType} registered
        in {ENTITY.country} with the Japan National Tax Agency under Corporate Number{" "}
        <strong>{ENTITY.corporateNumber}</strong>.
      </p>
      <p className="mt-2">Registered office: {ENTITY.address.full}</p>
      <p className="mt-2">
        {ENTITY.useStatement}. Sales are restricted to {ENTITY.audience}.
      </p>
    </div>
  );
}
