import {useMemo, useState} from 'react'
import { useParams } from "@tanstack/react-router"
import {
    Building2,
    GraduationCap,
    Presentation,
    Users
} from 'lucide-react'
import {Button} from '@shared/ui'
import {
    type Class,
    useClasses
} from "@entities/class"
import {
    AddClassForm,
    EditClassForm,
    DeleteClassAlert
} from '@features/class'
import {useTranslation} from "@shared/lib"
import {
    ClassDetailPanel,
    EmptyDetailPanel
} from "@/pages/class/ui";
import {getClassColumns} from "@/pages/class/ui/ClassColumns";
import {ClassesTable} from "@/pages/class/ui/ClassesTable";


const ClassesPage = () => {
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [selectedClass, setSelectedClass] = useState<Class | null>(null)
    const [isAddFormOpen, setIsAddFormOpen] = useState(false)
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)

    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })
    const { data: classes = [], isLoading } = useClasses(subSchoolId)

    const filteredData = useMemo(() => {
        if (activeFilter === 'active') return classes.filter((c) => c.isActive)
        if (activeFilter === 'inactive') return classes.filter((c) => !c.isActive)
        return classes
    }, [activeFilter, classes])

    const stats = [
        { label: 'Total classes', value: classes.length, icon: GraduationCap, trend: { value: '+12%', positive: true }, accent: 'primary' as const },
        { label: 'Élèves inscrits', value: classes.reduce((acc, c) => acc + (c.studentsCount || 0), 0), icon: Users, trend: { value: '+8%', positive: true }, accent: 'info' as const },
        { label: 'Enseignants', value: new Set(classes.map((c) => c.teacher).filter(Boolean)).size, icon: Presentation, trend: { value: '+3%', positive: true }, accent: 'success' as const },
        { label: 'Capacité totale', value: classes.reduce((acc, c) => acc + c.capacity, 0), icon: Building2, accent: 'warning' as const },
    ]

    const columns = useMemo(() => getClassColumns({
        t,
        onEdit: (classItem) => {
            setSelectedClass(classItem)
            setIsEditFormOpen(true)
        },
        onDelete: (classItem) => {
            setSelectedClass(classItem)
            setIsDeleteAlertOpen(true)
        },
    }), [t])

    const handleRowSelect = (row: Class | null) => {
        setSelectedClass(row);
    };

    const handleAddSuccess = () => {
        setIsAddFormOpen(false)
    }

    const handleEditSuccess = () => {
        setIsEditFormOpen(false)
        setSelectedClass(null)
    }

    const handleDeleteSuccess = () => {
        setIsDeleteAlertOpen(false)
        setSelectedClass(null)
    }

    const filters = [
        { id: 'all', label: 'Tous', value: '' },
        { id: 'active', label: 'Actifs', value: 'true' },
        { id: 'inactive', label: 'Inactifs', value: 'false' },
    ]

    return (
        <>
            <ClassesTable
                columns={columns}
                data={filteredData}
                searchPlaceholder="Rechercher une classe..."
                title="Classes"
                subtitle="Gérez et suivez toutes les classes de votre établissement"
                stats={stats}
                filters={filters}
                activeFilterId={activeFilter}
                onFilterChange={setActiveFilter}
                onRowSelect={handleRowSelect}
                renderDetailPanel={(selected) => selected
                    ? <ClassDetailPanel classItem={selected} />
                    : <EmptyDetailPanel />
            }
                isLoading={isLoading}
            >
                <Button className="h-10 rounded-xl gap-2 px-4" onClick={() => setIsAddFormOpen(true)}>
                    {t('dashboard.classes.add_class')}
                </Button>
            </ClassesTable>

            <AddClassForm
                isOpen={isAddFormOpen}
                handleOpen={() => setIsAddFormOpen(false)}
                handleSuccess={handleAddSuccess}
            />

            {selectedClass && (
                <EditClassForm
                    classItem={selectedClass}
                    isOpen={isEditFormOpen}
                    handleOpen={() => setIsEditFormOpen(false)}
                    handleSuccess={handleEditSuccess}
                />
            )}

            {selectedClass && (
                <DeleteClassAlert
                    classItem={selectedClass}
                    isOpen={isDeleteAlertOpen}
                    onOpenChange={setIsDeleteAlertOpen}
                    handleSuccess={handleDeleteSuccess}
                />
            )}
        </>
    )
}

export default ClassesPage