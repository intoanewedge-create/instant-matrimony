import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import Link from "next/link";
import { Heart, User, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { removeFavoriteAction } from "@/lib/actions/favorite.actions";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const result = await container.services.favoriteService.listFavorites(userId);
  const favorites: any[] = (result.success && result.data) ? result.data : [];

  async function handleRemove(formData: FormData) {
    "use server";
    const targetId = formData.get("favoriteUserId") as string;
    await removeFavoriteAction(targetId);
  }

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-6xl space-y-8 text-slate-200"
      data-testid="favorites-page"
    >
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
          My Favorites
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Profiles you shortlisted. Only you can see this list.
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card
          className="border border-slate-800 bg-slate-900/10 p-10 text-center text-sm text-slate-400"
          data-testid="favorites-empty"
        >
          You haven&apos;t added any favorites yet. Explore matches from the
          search page and tap the heart icon to shortlist profiles.
          <div className="mt-4">
            <Link href="/search">
              <Button className="bg-rose-600 hover:bg-rose-500">
                Browse Matches
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => {
            const target = fav.favoriteUser;
            const profile = target?.profile;
            const photo =
              profile?.photos?.find((p: any) => p.isMain)?.url ||
              profile?.photos?.[0]?.url;
            const age = profile?.dateOfBirth
              ? new Date().getFullYear() -
                new Date(profile.dateOfBirth).getFullYear()
              : "N/A";
            return (
              <Card
                key={fav.id}
                className="border border-slate-800 bg-slate-900/30 overflow-hidden"
                data-testid={`favorite-card-${fav.favoriteUserId}`}
              >
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt="Favorite"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    {profile ? (
                      <Link
                        href={`/profile/${profile.userId}`}
                        className="font-bold text-slate-100 hover:text-rose-400 transition-colors text-sm truncate block"
                        data-testid={`favorite-view-${fav.favoriteUserId}`}
                      >
                        {target.name || "Matrimony Member"}
                      </Link>
                    ) : (
                      <span className="font-bold text-slate-400 text-sm block">
                        {target?.name || "Matrimony Member"}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5 truncate flex items-center gap-1">
                      {profile ? (
                        <>
                          <MapPin className="w-3 h-3" />
                          {age} yrs • {profile.religion || "—"} •{" "}
                          {profile.city || "—"}
                        </>
                      ) : (
                        "No profile setup"
                      )}
                    </p>
                  </div>
                  <form action={handleRemove}>
                    <input
                      type="hidden"
                      name="favoriteUserId"
                      value={fav.favoriteUserId}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className="text-rose-400 hover:bg-rose-950/20"
                      data-testid={`favorite-remove-${fav.favoriteUserId}`}
                    >
                      <Heart className="w-4 h-4 fill-rose-500 mr-1" /> Remove
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
