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
      className="container mx-auto px-4 py-8 max-w-6xl space-y-8 text-slate-900"
      data-testid="favorites-page"
    >
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-600 fill-rose-100" />
          My Favorites
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Profiles you shortlisted. Only you can see this list.
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card
          className="border border-slate-200 bg-white p-12 text-center text-sm text-slate-600 shadow-sm"
          data-testid="favorites-empty"
        >
          <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-slate-600 max-w-md mx-auto">
            You haven&apos;t added any favorites yet. Explore matches from the
            search page and tap the heart icon to shortlist profiles.
          </p>
          <div className="mt-5">
            <Link href="/search">
              <Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold shadow-md shadow-rose-500/20">
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
                className="border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
                data-testid={`favorite-card-${fav.favoriteUserId}`}
              >
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt="Favorite"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    {profile ? (
                      <Link
                        href={`/profile/${profile.userId}`}
                        className="font-bold text-slate-900 hover:text-rose-600 transition-colors text-sm truncate block"
                        data-testid={`favorite-view-${fav.favoriteUserId}`}
                      >
                        {target.name || "Matrimony Member"}
                      </Link>
                    ) : (
                      <span className="font-bold text-slate-900 text-sm block">
                        {target?.name || "Matrimony Member"}
                      </span>
                    )}
                    <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
                      {profile ? (
                        <>
                          <MapPin className="w-3 h-3 text-rose-500" />
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
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold"
                      data-testid={`favorite-remove-${fav.favoriteUserId}`}
                    >
                      <Heart className="w-4 h-4 fill-rose-600 mr-1" /> Remove
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
