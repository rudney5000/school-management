import React from 'react'
import {
    Sheet,
    SheetContent, SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@shared/ui"

type CustomDrawerProps = {
    drawerTitle?: string;
    drawerDescription?: string
    handleOpen?: (e: any) => void;
    isOpen?: boolean
    children?: React.ReactNode
    direction?: "top" | "bottom" | "left" | "right"
}
const CustomDrawer: React.FC<CustomDrawerProps> = ({ drawerTitle, drawerDescription, children, isOpen, handleOpen, direction }) => {
    return (
        <Sheet open={isOpen} onOpenChange={handleOpen}>
            <SheetContent className="z-50 bg-white border-0" side={direction}>
                <SheetHeader>
                    <SheetTitle>{drawerTitle}</SheetTitle>
                    <SheetDescription>
                        {drawerDescription}
                    </SheetDescription>
                </SheetHeader>
                <div className="overflow-y-auto flex-1 pr-1">
                    {children}
                </div>
            </SheetContent>
        </Sheet>

    )
}

export default CustomDrawer