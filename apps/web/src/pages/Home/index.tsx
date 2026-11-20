import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { ChefCard } from "@/components/sections/chef-card";
import { ArrowRight, ChefHat, ShoppingBag, Truck } from "lucide-react";
import { useMemo } from "react";
import { sameLabel, translate } from "@/lib/utils";

export default function Home() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["chefs", "active", "popular"],
    queryFn: () => foodmeApi.getActiveChefs(0, 6),
  });

  const kitchens = useMemo(() => {
    if (!data) return [];
    return Array.from(
      new Set(
        data.exploreChefResponseDtoList
          .map((c) => {
            const kitchen = translate(c.kitchen);
            const name = translate(c.name);
            if (!kitchen || sameLabel(kitchen, name)) return "";
            return kitchen;
          })
          .filter(Boolean),
      ),
    ).sort();
  }, [data]);

  return (
    <div className="hp_wrapper w-full">
      {/* Uber-style hero: black band, bold type */}
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-8 md:py-16">
          <div>
            <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight">
              Real food, made by<br />
              <span className="text-[#06C167]">real people</span> near you.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">
              Independent local chefs. Fresh menus. Cash on delivery at your door.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white font-bold text-black hover:bg-zinc-200"
              >
                <Link to="/explore" className="inline-flex items-center gap-2">
                  Explore chefs
                  <ArrowRight size={17} strokeWidth={2.5} />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="border border-zinc-700 bg-transparent font-bold text-white hover:bg-zinc-900"
              >
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-[#06C167] p-6 text-black md:p-8">
            <p className="text-sm font-bold uppercase tracking-wide opacity-70">Delivery from</p>
            <p className="mt-1 text-5xl font-black tracking-tight">25–40 min</p>
            <p className="mt-3 max-w-xs text-sm font-semibold opacity-80">
              Nearby kitchens cooking now. Free delivery from select chefs.
            </p>
            <Button
              asChild
              className="mt-6 bg-black font-bold text-white hover:bg-zinc-800"
              size="lg"
            >
              <Link to="/explore">Order now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Kitchen chips (from live data) */}
      {kitchens.length > 0 && (
        <div className="border-b border-zinc-100 bg-white">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 scrollbar-hide md:px-8">
            <Link to="/explore" className="eda-chip eda-chip-active">
              All
            </Link>
            {kitchens.map((k) => (
              <Link key={k} to={`/explore?q=${encodeURIComponent(k)}`} className="eda-chip">
                {k}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-[140px] md:scroll-mt-[84px] mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 md:text-3xl">
          Three steps to your next favourite meal
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: ChefHat,
              title: "Find your chef",
              body: "Browse independent local chefs, each with their own unique menu and kitchen style.",
            },
            {
              icon: ShoppingBag,
              title: "Pick your dishes",
              body: "Add your favourites, sign in, and check out — cash on delivery, with a history you can track.",
            },
            {
              icon: Truck,
              title: "Fresh at the door",
              body: "Your meal is cooked to order and handed to you warm, never sitting under a heat lamp.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-zinc-100 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#06C167]/10">
                <Icon size={20} strokeWidth={2.25} className="text-[#06C167]" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feed */}
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8 md:pb-16">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 md:text-3xl">
            Chefs worth knowing
          </h2>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 text-sm font-bold text-zinc-900 hover:underline"
          >
            View all
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <div className="aspect-[16/9] rounded-2xl skeleton-shimmer" />
                <div className="mt-3 h-4 w-2/3 rounded skeleton-shimmer" />
                <div className="mt-2 h-3 w-1/2 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center py-8 text-center" role="alert">
            <p className="text-sm text-zinc-600">Could not load chefs right now.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}

        {data && data.exploreChefResponseDtoList.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.exploreChefResponseDtoList.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
        )}
        {data && data.exploreChefResponseDtoList.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 px-5 py-10 text-center">
            <p className="font-bold text-zinc-900">No chefs are cooking right now</p>
            <p className="mt-1 text-sm text-zinc-500">Check back soon for fresh menus.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="overflow-hidden rounded-2xl bg-black px-6 py-12 text-center md:px-10 md:py-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Your next favourite meal is one tap away.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
            Discover home kitchens cooking tonight — browse, pick, and pay on delivery.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-7 bg-[#06C167] font-bold text-white hover:bg-[#05a85a]"
          >
            <Link to="/explore">Browse chefs</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
