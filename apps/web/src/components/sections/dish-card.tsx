import type { MouseEvent } from "react";
import { Plus } from "lucide-react";
import { formatAmd } from "@/lib/utils";
import { SafeImage } from "@/components/ui/safe-image";
import { addDishToCart } from "@/hooks/useCart";
import type { DishDto } from "@/types";

interface DishCardProps {
  dish: DishDto;
  onOpen: (dish: DishDto) => void;
  onChefMismatch?: (dish: DishDto, quantity: number) => void;
}

export function DishCard({ dish, onOpen, onChefMismatch }: DishCardProps) {
  const quickAdd = async (event: MouseEvent) => {
    event.stopPropagation();
    // Quick add selects no options: dish.additions lists what is *available*, not what was chosen (KAN-9).
    const plainDish: DishDto = { ...dish, additions: [] };
    const qty = Math.max(dish.minimumOrderCount ?? 1, 1);
    const result = await addDishToCart(plainDish, qty);
    if (result === "mismatch") onChefMismatch?.(plainDish, qty);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpen(dish)}
        className="dc_card group flex w-full items-stretch justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-3 text-start transition-shadow hover:shadow-diffuse-lg sm:p-4"
      >
        <div className="min-w-0 flex-1 py-0.5">
          <p className="text-[15px] font-bold leading-snug text-zinc-900">{dish.nameEn}</p>
          <p className="mt-1 text-[15px] font-medium tabular-nums text-zinc-700">
            {formatAmd(dish.price)}
          </p>
          {dish.portionEn && dish.portionEn.trim() && dish.portionEn.trim() !== "1" && (
            <p className="mt-0.5 text-xs font-medium text-zinc-400">{dish.portionEn}</p>
          )}
          {dish.descriptionEn && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500">
              {dish.descriptionEn}
            </p>
          )}
        </div>
        <div className="relative h-[104px] w-[120px] shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-[112px] sm:w-[132px]">
          <SafeImage src={dish.url} alt={dish.nameEn} className="h-full w-full object-cover" />
        </div>
      </button>
      <button
        type="button"
        onClick={(event) => void quickAdd(event)}
        aria-label={`Add ${dish.nameEn} to cart`}
        className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-900 shadow-diffuse-lg transition-transform hover:scale-105 sm:bottom-5 sm:right-5"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
