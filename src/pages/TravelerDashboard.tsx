import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTravelerProfile } from "@/hooks/useTravelerProfile";
import UpcomingBookings from "@/components/traveler/UpcomingBookings";
import PastTours from "@/components/traveler/PastTours";
import SavedGuidesList from "@/components/traveler/SavedGuidesList";
import MessagesInbox from "@/components/traveler/MessagesInbox";
import { Settings } from "lucide-react";

const TravelerDashboard = () => {
  const navigate = useNavigate();
  const { profile, loading, isLoggedIn, userId } = useTravelerProfile();

  useEffect(() => {
    if (!loading && !isLoggedIn) navigate("/login");
  }, [loading, isLoggedIn, navigate]);

  if (loading || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const initials = ((profile.first_name[0] || "") + (profile.last_name[0] || "")) || "U";
  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || "Traveler";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={fullName} />}
              <AvatarFallback className="text-base">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Welcome, {profile.first_name || "Traveler"}</h1>
              {profile.country && <p className="text-sm text-muted-foreground">{profile.country}</p>}
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/traveler/onboarding")}>
            <Settings className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Tours</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <UpcomingBookings userId={userId} />
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            <PastTours userId={userId} />
          </TabsContent>
          <TabsContent value="saved" className="mt-6">
            <SavedGuidesList userId={userId} />
          </TabsContent>
          <TabsContent value="messages" className="mt-6">
            <MessagesInbox userId={userId} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default TravelerDashboard;
