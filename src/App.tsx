import BlueBlob from "@/assets/blob-blue.png";
import GrayBlob from "@/assets/blob-gray.png";
import OrangeBlob1 from "@/assets/blob-orange-1.png";
import OrangeBlob2 from "@/assets/blob-orange-2.png";
import PinkBlob from "@/assets/blob-pink.png";
import PurpleBlob from "@/assets/blob-purple.png";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowDownWideNarrow,
  CalendarIcon,
  Loader2,
  PartyPopper,
  Rocket,
  X,
} from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Calendar } from "./components/ui/calendar";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { Toaster } from "./components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { toast } from "./components/ui/use-toast";
import ViewShortUrl from "./custom/ViewShortUrl";
import { cn } from "./lib/utils";
import { API_DOMAIN, SHORTEN_ENDPOINT } from "./utils/constants";
import { ShortUrl, Stats } from "./utils/types";
import { ToastAction } from "./components/ui/toast";

const App = () => {
  const [inputUrl, setInputUrl] = useState("");
  const [date, setDate] = useState<Date>();
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([]);

  const generateShortUrl = async (longUrl: string) => {
    const response = await axios.post(`${API_DOMAIN}${SHORTEN_ENDPOINT}`, {
      url: longUrl,
      expirationDate: date,
    });
    const data = await response.data;
    return data;
  };

  const getStats = async (key: string): Promise<Stats> => {
    const response = await axios.get(`${API_DOMAIN}/short/${key}/stats`);
    const data = await response.data;
    return data as Stats;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputUrl.length === 0) return;
    mutate(inputUrl);
  };

  const { isPending, mutate } = useMutation({
    mutationFn: generateShortUrl,
    onSuccess: async (newUrl) => {
      const stats = await getStats(newUrl.key);
      const newShortUrl: ShortUrl = {
        ...newUrl,
        ...stats,
        created_at: new Date(stats?.created_at),
        expire_at: new Date(stats?.expire_at),
      };
      const newUrls = [...shortUrls, newShortUrl];
      localStorage.setItem("shawty", JSON.stringify(newUrls));
      setShortUrls([...newUrls]);
      setInputUrl("");
      setDate(undefined);
      toast({
        description: (
          <div className="flex space-x-3 items-start">
            <PartyPopper />
            <p>Yay! New Url Created</p>
          </div>
        ),
      });
    },
    onError: () => {
      toast({
        description: (
          <div className="flex space-x-3 items-start">
            <AlertCircle />
            <p>Oops! Unexpeceted error occured</p>
          </div>
        ),
        action: (
          <ToastAction
            altText="Retry"
            className="border border-gray-500 bg-transparent text-gray-300 hover:bg-gray-600"
            onClick={() => mutate(inputUrl)}
          >
            Retry
          </ToastAction>
        ),
      });
    },
  });

  const loadUrls = async () => {
    const urls = localStorage.getItem("shawty");
    if (urls) {
      const parsedUrls = await JSON.parse(urls);
      const activeUrls = [];
      for (const url of parsedUrls) {
        if (new Date(url.expire_at).getTime() >= new Date().getTime()) {
          const updatedStats = await getStats(url.key);
          activeUrls.push({
            ...url,
            ...updatedStats,
            created_at: new Date(updatedStats.created_at),
            expire_at: new Date(updatedStats.expire_at),
          });
        }
      }
      const sortedUrls = activeUrls.sort((a, b) => {
        const dateA = a.created_at;
        const dateB = b.created_at;
        return dateB.getTime() - dateA.getTime();
      });
      setShortUrls([...sortedUrls]);
    }
  };

  useEffect(() => {
    loadUrls();
  }, []);

  const removeShortUrl = (key: string) => {
    const newUrls = shortUrls.filter((url) => url.key !== key);
    setShortUrls([...newUrls]);
    localStorage.setItem("shawty", JSON.stringify([...newUrls]));
  };

  return (
    <div className="w-screen h-screen relative overflow-clip">
      <div id="blob-container">
        <img
          src={GrayBlob}
          height={800}
          width="auto"
          className="absolute -left-96 z-0"
        />
        <img
          src={PinkBlob}
          height={200}
          width={200}
          className="absolute top-0 right-0 z-0"
        />
        <img
          src={OrangeBlob1}
          height={200}
          width={300}
          className="absolute top-20 right-40 z-0"
        />
        <img
          src={OrangeBlob2}
          height="auto"
          width={500}
          className="absolute top-60 -right-32 z-0"
        />
        <img
          src={BlueBlob}
          height="auto"
          width={500}
          className="absolute top-60 right-64 z-0"
        />
        <img
          src={PurpleBlob}
          height="auto"
          width={600}
          className="absolute top-60 right-[40%] z-0"
        />
      </div>
      <div className="w-screen h-screen backdrop-blur-[100px] backdrop-brightness-50 z-20"></div>
      <div className="absolute inset-0 w-screen h-screen z-50 mx-auto px-5 md:w-2/3 lg:w-2/5">
        <div className="h-screen w-full flex flex-col justify-start pt-28">
          <h1 className="text-5xl font-bold text-gray-200 w-full text-center lg:text-6xl">
            Short Links With
            <br />
            <span className="bg-gradient-to-r from-sky-700 via-sky-500 to-sky-800 text-transparent bg-clip-text">
              Superpowers
            </span>
          </h1>
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="w-full flex items-center space-x-1 mt-16"
          >
            <div className="w-full bg-gray-700 rounded-md flex justify-between">
              <Input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste URL here..."
                className="bg-transparent ring-0 text-gray-300 outline-none border-none focus-visible:ring-0 text-base"
                disabled={isPending}
              />
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <Popover>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button
                          className={cn(
                            "justify-start text-left text-gray-300 font-normal bg-transparent outline-none ring-0 hover:bg-transparent",
                            !date && "text-muted-foreground"
                          )}
                          disabled={isPending}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <></>}
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set Link Expiration Date</p>
                    </TooltipContent>
                    <PopoverContent className="w-auto p-0 bg-gray-700 text-gray-300 border-gray-600">
                      <p className="w-full py-2 text-gray-400 text-center font-medium">
                        Set Link Expiration Date
                      </p>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Tooltip>
              </TooltipProvider>
              {date && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip defaultOpen={false}>
                    <TooltipTrigger asChild>
                      <Button
                        className="w-10 h-10 p-1 bg-transparent text-gray-400 hover:bg-transparent hover:text-gray-300"
                        onClick={() => setDate(undefined)}
                      >
                        <X size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove Expiration Date</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <TooltipProvider delayDuration={0}>
              <Tooltip defaultOpen={false}>
                <TooltipTrigger asChild>
                  <Button
                    className="aspect-square p-1 m-0 bg-gradient-to-t from-sky-800 via-sky-700 to-sky-500 hover:brightness-90 transition-all duration-100 ease-in"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 strokeWidth={1.5} className="animate-spin" />
                    ) : (
                      <Rocket strokeWidth={1.5} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate Short Link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </form>
          <div id="view-url">
            {shortUrls.length > 0 && (
              <>
                <h3 className="mt-10 text-gray-400 text-2xl font-semibold self-start mb-3 flex items-center space-x-2">
                  <ArrowDownWideNarrow className="pt-1" />
                  <p>Recents</p>
                </h3>
                <ScrollArea className="w-full h-[440px]">
                  {shortUrls.map((url) => (
                    <ViewShortUrl
                      key={url.key}
                      short_url={url.short_url}
                      long_url={url.long_url}
                      clicks={url.clicks}
                      created_at={url.created_at}
                      expire_at={url.expire_at}
                      removeShortUrl={() => removeShortUrl(url.key)}
                    />
                  ))}
                </ScrollArea>
              </>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
