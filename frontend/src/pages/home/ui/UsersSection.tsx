import React from 'react';
import {BarChart3, BookOpen, GraduationCap, Users} from "lucide-react";
import { useTranslation } from '@/shared/lib/useTranslation';

interface UserType {
  title: string;
  desc: string;
  icon: Node.icon;
  color: string;
}

interface UsersSectionProps {
  userTypes?: UserType[];
}

export const UsersSection: React.FC<UsersSectionProps> = ({ userTypes }) => {
  const { t } = useTranslation();
  
  const defaultUserTypes: UserType[] = userTypes || [
    {
      icon: <GraduationCap className="h-5 w-5" />,
      title: t('home.users.students'),
      desc: t('home.users.students_description'),
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: t('home.users.teachers'),
      desc: t('home.users.teachers_description'),
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: t('home.users.parents'),
      desc: t('home.users.parents_description'),
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: t('home.users.administration'),
      desc: t('home.users.administration_description'),
      color: "bg-rose-100 text-rose-600",
    },
  ];

  return (
      <section id="users" className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold">
            {t('home.users.platform_for_all')}
          </h2>

          <p className="text-slate-600">
            {t('home.users.everyone_finds_place')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {defaultUserTypes.map((userType, index) => (
              <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{userType.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{userType.title}</h3>
                <p className="text-gray-600">{userType.desc}</p>
              </div>
          ))}
        </div>
      </section>
  );
};
