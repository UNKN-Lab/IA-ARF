import { ArrowUpIcon, Plus } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from "@/components/ui/input-group"
export default function InputGroupDemo() {
    return (
        <div className="grid w-full max-w-sm gap-6">
            <InputGroup>
                <InputGroupTextarea placeholder="Ask, Search or Chat..." />
                <InputGroupAddon align="block-end">
                    <InputGroupButton
                        variant="outline"
                        className="rounded-full"
                        size="icon-xs"
                    >
                        <Plus />
                    </InputGroupButton>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <InputGroupButton variant="ghost">Auto</InputGroupButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            align="start"
                            className="[--radius:0.95rem]"
                        >
                            <DropdownMenuItem>Auto</DropdownMenuItem>
                            <DropdownMenuItem>Agent</DropdownMenuItem>
                            <DropdownMenuItem>Manual</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <InputGroupButton
                        variant="default"
                        className="rounded-full ml-auto"
                        size="icon-xs"
                        disabled
                    >
                        <ArrowUpIcon />
                        <span className="sr-only">Send</span>
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </div>
    )
}
