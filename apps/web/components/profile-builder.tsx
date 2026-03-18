"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@puqme/ui";
import { PageHeader } from "@/components/page-header";
import { fetchMyProfile, updateMyProfile } from "@/lib/profile";

type FormState = {
  displayName: string;
  birthDate: string;
  bio: string;
  occupation: string;
  city: string;
};

const initialFormState: FormState = {
  displayName: "",
  birthDate: "",
  bio: "",
  occupation: "",
  city: ""
};

export function ProfileBuilder() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchMyProfile();
        if (cancelled) {
          return;
        }

        setForm({
          displayName: data.profile.displayName,
          birthDate: data.profile.birthDate,
          bio: data.profile.bio ?? "",
          occupation: data.profile.occupation ?? "",
          city: data.profile.city ?? ""
        });
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Profil konnte nicht geladen werden.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit() {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (form.displayName.trim().length < 2) {
      setErrorMessage("Dein Anzeigename braucht mindestens 2 Zeichen.");
      return;
    }

    if (!form.birthDate) {
      setErrorMessage("Bitte trage dein Geburtsdatum ein.");
      return;
    }

    setIsSaving(true);

    try {
      await updateMyProfile({
        displayName: form.displayName.trim(),
        birthDate: form.birthDate,
        bio: form.bio.trim() || undefined,
        occupation: form.occupation.trim() || undefined,
        city: form.city.trim() || undefined
      });

      setSuccessMessage("Profil gespeichert. Dein Auftritt ist jetzt live.");
      window.setTimeout(() => router.push("/profile"), 600);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Profil konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-4">
      <PageHeader
        eyebrow="Profil erstellen"
        title="Zeig deine beste Seite"
        description="Ein starkes Profil wird besser gefunden und fuehlt sich direkt vertrauenswuerdig an."
      />

      <Card className="mesh-panel rounded-[2rem] p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Die wichtigsten Angaben zuerst</div>
            <div className="mt-1 text-sm text-white/70">Echter Save-Flow statt Demo-Felder.</div>
          </div>
          <div className="soft-pill rounded-full px-3 py-1 text-[11px] font-semibold">Live</div>
        </div>

        <div className="grid gap-3">
          <input
            className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
            onChange={(event) => updateField("displayName", event.target.value)}
            placeholder="Anzeigename"
            value={form.displayName}
          />
          <input
            className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
            onChange={(event) => updateField("birthDate", event.target.value)}
            type="date"
            value={form.birthDate}
          />
          <textarea
            className="min-h-28 rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
            maxLength={500}
            onChange={(event) => updateField("bio", event.target.value)}
            placeholder="Kurze Bio"
            value={form.bio}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
              onChange={(event) => updateField("occupation", event.target.value)}
              placeholder="Beruf"
              value={form.occupation}
            />
            <input
              className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="Stadt"
              value={form.city}
            />
          </div>
        </div>
      </Card>

      <Card className="glass-card rounded-[2rem] p-5 text-white">
        <div className="text-sm font-semibold text-white">Status</div>
        <div className="mt-3 text-sm text-white/72">
          {isLoading ? "Profil wird geladen..." : "Dein Profil ist jetzt mit dem Backend verbunden."}
        </div>
        {errorMessage ? <div className="mt-3 text-sm text-[#ffb4c7]">{errorMessage}</div> : null}
        {successMessage ? <div className="mt-3 text-sm text-[#b8ffd9]">{successMessage}</div> : null}
      </Card>

      <Button className="glow-button rounded-[1.35rem] py-4 text-sm font-semibold" disabled={isLoading || isSaving} onClick={() => void handleSubmit()}>
        {isSaving ? "Profil wird gespeichert..." : "Profil speichern"}
      </Button>
    </section>
  );
}
