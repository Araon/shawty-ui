import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import clsx from "clsx";
import { BarChart, Check, Copy, X } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

const Viewshort_url = ({
  short_url,
  long_url,
  clicks,
  created_at,
  expire_at,
  removeShortUrl,
}: {
  short_url: string;
  long_url: string;
  clicks: number;
  created_at: Date;
  expire_at: Date;
  removeShortUrl: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Display success message for 2 seconds
    } catch (err) {
      toast({
        description: "Unable to copy text",
      });
    }
  };
  const getDaysDifference = (date1: Date, date2: Date) => {
    const timeDifference = Math.abs(date1.getTime() - date2.getTime());
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  };

  const dateDiffInDays = getDaysDifference(created_at, expire_at);

  return (
    <div className="h-20 px-4 mr-1 bg-gray-800 rounded-lg shadow-md flex flex-col justify-center my-2 relative group">
      <div className="flex items-center space-x-3">
        <a
          href={short_url}
          target="_blank"
          className="text-sky-600 font-semibold hover:underline cursor-pointer"
        >
          {short_url.replace("https://", "")}
        </a>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full bg-gray-700 text-gray-100 hover:bg-gray-600 hover:text-white"
                onClick={() => handleCopy()}
              >
                {copied ? (
                  <Check strokeWidth={1} size={14} />
                ) : (
                  <Copy strokeWidth={1} size={14} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Copied!" : "Copy Short URL"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex items-end text-sm space-x-1 bg-gray-700 text-gray-400 px-2 py-1 rounded-sm cursor-default">
          <BarChart strokeWidth={1.5} size={20} />
          {clicks > 1000 ? (
            <p>{Math.round((clicks / 1000) * 10) / 10}K</p>
          ) : (
            clicks
          )}
          <span>Clicks</span>
        </div>
        <div
          className={clsx(
            "flex items-end text-sm space-x-1 bg-gray-700 text-gray-400 px-2 py-1 rounded-sm cursor-default",
            dateDiffInDays === 0 && "bg-red-400/70 text-red-700",
            dateDiffInDays <= 10 && "bg-orange-400/70 text-orange-700"
          )}
        >
          {dateDiffInDays > 10 ? (
            <p>Expires On: {format(expire_at, "MMM dd, yyyy")}</p>
          ) : dateDiffInDays === 0 ? (
            <p>Expires: Today</p>
          ) : (
            <p>Expires In: {dateDiffInDays} days</p>
          )}
        </div>
      </div>
      <a
        href={long_url}
        className="pt-1 w-96 truncate font-medium text-gray-500 text-sm hover:underline"
      >
        {long_url}
      </a>
      <Button
        onClick={() => removeShortUrl()}
        className="absolute w-6 h-6 rounded-full top-1 right-2 p-0 bg-transparent hover:bg-transparent hidden group-hover:flex"
      >
        <X size={14} className="stroke-gray-600 hover:stroke-gray-300" />
      </Button>
    </div>
  );
};

export default Viewshort_url;
