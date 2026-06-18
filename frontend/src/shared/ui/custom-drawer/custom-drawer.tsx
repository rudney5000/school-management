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
            <SheetContent 
                className="z-50 bg-white border-l border-gray-100 shadow-2xl rounded-l-2xl" 
                side={direction}
                style={{
                    boxShadow: '-4px 0 24px rgba(23, 85, 236, 0.08)'
                }}
            >
                <SheetHeader className="pb-4 border-b border-gray-100">
                    <SheetTitle className="text-xl font-semibold text-gray-900">{drawerTitle}</SheetTitle>
                    <SheetDescription className="text-sm text-gray-500 mt-1">
                        {drawerDescription}
                    </SheetDescription>
                </SheetHeader>
                <div className="overflow-y-auto flex-1 pr-2 py-4">
                    {children}
                </div>
            </SheetContent>
        </Sheet>

    )
}

export default CustomDrawer