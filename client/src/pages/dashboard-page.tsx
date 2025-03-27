import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import PeerCard from "@/components/peer-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("All Skills");
  const [experienceFilter, setExperienceFilter] = useState("All Experience Levels");
  
  // Fetch available peers
  const { data: peers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Fetch best matches
  const { data: bestMatches, isLoading: isLoadingBestMatches } = useQuery<(User & { matchScore: number })[]>({
    queryKey: ["/api/best-match"],
  });
  
  // Filter peers based on search query and filters
  const filteredPeers = peers?.filter(peer => {
    const matchesSearch = searchQuery 
      ? peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer.username.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesSkill = skillFilter !== "All Skills" 
      ? peer.skills.includes(skillFilter) 
      : true;
      
    const matchesExperience = experienceFilter !== "All Experience Levels" 
      ? peer.experienceLevel === experienceFilter 
      : true;
      
    return matchesSearch && matchesSkill && matchesExperience;
  });
  
  const handleFindBestMatch = () => {
    if (bestMatches && bestMatches.length > 0) {
      toast({
        title: "Best matches found!",
        description: "We've found some great matches for you based on your profile."
      });
    } else {
      toast({
        title: "No matches found",
        description: "Try adjusting your profile or check back later for new users.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <MobileNav />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Find Your Interview Partner</h2>
            <p className="mt-1 text-gray-600">Match with peers, schedule practice interviews, and improve together.</p>
          </div>
          
          {/* Tabs Navigation */}
          <Tabs defaultValue="available-peers" className="w-full">
            <div className="border-b border-gray-200 mb-6">
              <TabsList className="flex space-x-8 -mb-px bg-transparent">
                <TabsTrigger 
                  value="available-peers"
                  className="data-[state=active]:border-primary data-[state=active]:text-primary pb-4 px-1 border-b-2 data-[state=inactive]:border-transparent text-sm font-medium data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300"
                >
                  Available Peers
                </TabsTrigger>
                <TabsTrigger 
                  value="best-matches"
                  className="data-[state=active]:border-primary data-[state=active]:text-primary pb-4 px-1 border-b-2 data-[state=inactive]:border-transparent text-sm font-medium data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300"
                >
                  Best Matches
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="available-peers">
              {/* Search and Filter */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:w-1/3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400 h-5 w-5" />
                  </div>
                  <Input 
                    type="text" 
                    className="pl-10 pr-3 py-2"
                    placeholder="Search peers..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3 flex-wrap">
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Skills" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Skills">All Skills</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Node.js">Node.js</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="HTML/CSS">HTML/CSS</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger className="w-[190px]">
                      <SelectValue placeholder="All Experience Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Experience Levels">All Experience Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={handleFindBestMatch}>
                    <Shuffle className="mr-2 h-4 w-4" /> Find Best Match
                  </Button>
                </div>
              </div>
              
              {/* Available Peers Grid */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredPeers && filteredPeers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredPeers.map((peer) => (
                    <PeerCard key={peer.id} peer={peer} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-lg font-medium text-gray-900">No peers found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your filters or search query</p>
                </div>
              )}
              
              {/* Load More Button */}
              {filteredPeers && filteredPeers.length > 6 && (
                <div className="text-center mt-8">
                  <Button variant="outline">
                    Load More
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="best-matches">
              {isLoadingBestMatches ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : bestMatches && bestMatches.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Your Top Matches</h3>
                    <p className="text-sm text-gray-500">Based on your skills and experience level</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {bestMatches.map((peer) => (
                      <PeerCard 
                        key={peer.id} 
                        peer={peer} 
                        matchScore={peer.matchScore} 
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
                  <p className="mt-1 text-gray-500">Try updating your profile or check back later</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
