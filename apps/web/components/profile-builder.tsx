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
          setErrorMessage(error instanceof Error ? error.message : "Could not load profile.");
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
      setErrorMessage("Display name needs at least 2 characters.");
      return;
    }

    if (!form.birthDate) {
      setErrorMessage("Please enter your date of birth.");
      return;
    }

    setIsSaving(true);

    try {
      const profileInput: Parameters<typeof updateMyProfile>[0] = {
        displayName: form.displayName.trim(),
        birthDate: form.birthDate
      };

      const bio = form.bio.trim();
      const occupation = form.occupation.trim();
      const city = form.city.trim();

      if (bio) {
        profileInput.bio = bio;
      }

      if (occupation) {
        profileInput.occupation = occupation;
      }

      if (city) {
        profileInput.city = city;
      }

      await updateMyProfile(profileInput);

      setSuccessMessage("Profile saved and live.");
      window.setTimeout(() => router.push("/profile"), 600);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-4">
      <PageHeader
        eyebrow="Create profile"
        title="Show your best side"
        description="A strong profile gets found more easily and builds trust."
      />

      <Card className="mesh-panel rounded-[2rem] p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Key details first</div>
            <div className="mt-1 text-sm text-white/70">Real save flow, not demo fields.</div>
          </div>
          <div className="soft-pill rounded-full px-3 py-1 text-[11px] font-semibold">Live</div>
        </div>

        <div className="grid gap-3">
          <input
            className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
            onChange={(event) => updateField("displayName", event.target.value)}
            placeholder="Display name"
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
              placeholder="Occupation"
              value={form.occupation}
            />
            <input
              className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="City"
              value={form.city}
            />
          </div>
        </div>
      </Card>

      <Card className="glass-card rounded-[2rem] p-5 text-white">
        <div className="text-sm font-semibold text-white">Status</div>
        <div className="mt-3 text-sm text-white/72">
          {isLoading ? "Loading profile..." : "Your profile is connected."}
        </div>
        {errorMessage ? <div className="mt-3 text-sm text-[#ffb4c7]">{errorMessage}</div> : null}
        {successMessage ? <div className="mt-3 text-sm text-[#b8ffd9]">{successMessage}</div> : null}
      </Card>

      <Button className="glow-button rounded-[1.35rem] py-4 text-sm font-semibold" disabled={isLoading || isSaving} onClick={() => void handleSubmit()}>
        {isSaving ? "Saving profile..." : "Save profile"}
      </Button>
    </section>
  );
}
