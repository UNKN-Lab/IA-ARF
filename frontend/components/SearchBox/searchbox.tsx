import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchBox() {
  return (
    <div className="flex items-center justify-center gap-2 w-full max-w-xl">
      <Input placeholder="Ask anything..." className="flex-1 h-12 rounded-xl" />
      <Button size="icon" className="h-12 w-12 rounded-xl">
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
}
