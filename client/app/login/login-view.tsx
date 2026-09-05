"use client";

import { ChefHat, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { IconField } from "@/components/icon-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export function LoginView() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch {
      toast.error("Credenciales inválidas. Verifica tu correo y contraseña.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-tint">
      <IconField />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-12">
          <form
            className="w-full max-w-sm rounded-[32px] bg-bone-white p-8 shadow-[var(--shadow-lift)] sm:p-10"
            onSubmit={handleSubmit}
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-button)]">
              <ChefHat className="size-6" />
            </span>
            <h1 className="mt-6 font-display text-3xl font-medium tracking-[-0.02em] text-ink">
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-sm text-graphite">
              Entra al panel de Casa Aurora para ver reservas, pedidos y catálogo del día.
            </p>

            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo del equipo</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="mt-6 w-full" disabled={submitting}>
              {submitting ? "Ingresando…" : "Ingresar al panel"}
            </Button>
            <p className="mt-4 text-xs text-fog">Autenticación conectada al backend del CRM.</p>
          </form>
        </div>

        <div className="hidden flex-col justify-between p-12 lg:flex">
          <p className="text-sm font-medium text-graphite">Mesa CRM</p>
          <div>
            <h2 className="font-display text-4xl font-medium leading-tight tracking-[-0.02em] text-ink">
              Reservas, pedidos y menú en un solo lugar.
            </h2>
            <p className="mt-4 max-w-md text-sm text-graphite">
              Diseñado para operar el servicio en vivo: agenda por franjas, pedidos por estado y
              control de disponibilidad del menú.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["Agenda del día", "Franjas de 30 min por mesa", "bg-lavender-wash"],
                ["Pedidos", "Nuevo · Cocina · Servido · Cerrado", "bg-mint-wash"],
                ["Catálogo", "CRUD de platos y bebidas", "bg-powder-blue"],
                ["Agente IA", "Próximamente conectado", "bg-solar-wash"],
              ].map(([label, hint, wash]) => (
                <div key={label} className={cn("rounded-3xl p-4", wash)}>
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="mt-1 text-xs text-graphite">{hint}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs text-graphite">
            <Sparkles className="size-3.5 text-iris-blue" /> Login conectado al backend; el resto
            del panel aún usa datos de demostración.
          </p>
        </div>
      </div>
    </div>
  );
}
