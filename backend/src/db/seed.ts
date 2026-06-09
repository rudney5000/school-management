import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {db} from './index';
import {
    schools,
    subSchools,
    districts,
    cities,
    departments,
    countries,
    workers,
    students,
    users,
    teacherSchools,
    teachers,
    parents,
    classes,
    parentStudents,
    courses,
} from './schema';
import {and, eq} from 'drizzle-orm';

async function seed() {
    console.log('Seeding...');

    const insertedCountries = await db.insert(countries)
        .values([
            {name: 'République Démocratique du Congo', code: 'COD'},
            {name: 'Congo', code: 'COG'},
            {name: 'Angola', code: 'AGO'},
            {name: 'Zambie', code: 'ZMB'},
            {name: 'Tanzanie', code: 'TZA'},
            {name: 'Burundi', code: 'BDI'},
            {name: 'Rwanda', code: 'RWA'},
            {name: 'Ouganda', code: 'UGA'},
            {name: 'Soudan du Sud', code: 'SSD'},
            {name: 'Centrafrique', code: 'CAF'},
        ])
        .onConflictDoNothing()
        .returning();

    const allCountries = insertedCountries.length
        ? insertedCountries
        : await db.select().from(countries);

    console.log(`✓ ${allCountries.length} Countries`);

    const rdc = allCountries.find(c => c.code === 'COD')!;
    const congo = allCountries.find(c => c.code === 'COG')!;

    const insertedDepartments = await db.insert(departments)
        .values([
            {name: 'Kinshasa', code: 'KIN', countryId: rdc.id},
            {name: 'Bas-Uele', code: 'BU', countryId: rdc.id},
            {name: 'Équateur', code: 'EQ', countryId: rdc.id},
            {name: 'Haut-Katanga', code: 'HK', countryId: rdc.id},
            {name: 'Haut-Lomami', code: 'HL', countryId: rdc.id},
            {name: 'Brazzaville', code: 'BZV', countryId: congo.id},
            {name: 'Pointe-Noire', code: 'PNR', countryId: congo.id},
            {name: 'Niari', code: 'NIA', countryId: congo.id},
            {name: 'Bouenza', code: 'BOU', countryId: congo.id},
            {name: 'Lékoumou', code: 'LEK', countryId: congo.id},
        ])
        .onConflictDoNothing()
        .returning();

    const allDepartments = insertedDepartments.length
        ? insertedDepartments
        : await db.select().from(departments);

    console.log(`✓ ${allDepartments.length} Departments`);

    const kinshasa = allDepartments.find(d => d.code === 'KIN')!;
    const buUele = allDepartments.find(d => d.code === 'BU')!;
    const equateur = allDepartments.find(d => d.code === 'EQ')!;
    const hautKat = allDepartments.find(d => d.code === 'HK')!;
    const hautLom = allDepartments.find(d => d.code === 'HL')!;
    const brazza = allDepartments.find(d => d.code === 'BZV')!;
    const pNoire = allDepartments.find(d => d.code === 'PNR')!;
    const niari = allDepartments.find(d => d.code === 'NIA')!;
    const bouenza = allDepartments.find(d => d.code === 'BOU')!;
    const lekoumou = allDepartments.find(d => d.code === 'LEK')!;

    const insertedCities = await db.insert(cities)
        .values([
            {name: 'Kinshasa', departmentId: kinshasa.id},
            {name: 'Kisangani', departmentId: buUele.id},
            {name: 'Mbandaka', departmentId: equateur.id},
            {name: 'Lubumbashi', departmentId: hautKat.id},
            {name: 'Kamina', departmentId: hautLom.id},
            {name: 'Brazzaville', departmentId: brazza.id},
            {name: 'Pointe-Noire', departmentId: pNoire.id},
            {name: 'Dolisie', departmentId: niari.id},
            {name: 'Mouyondzi', departmentId: bouenza.id},
            {name: 'Sibiti', departmentId: lekoumou.id},
        ])
        .onConflictDoNothing()
        .returning();

    const allCities = insertedCities.length
        ? insertedCities
        : await db.select().from(cities);

    console.log(`✓ ${allCities.length} Cities`);

    const kinshasaCity = allCities.find(c => c.name === 'Kinshasa')!;

    const insertedDistricts = await db.insert(districts)
        .values([
            {name: 'Gombe', cityId: kinshasaCity.id},
            {name: 'Lingwala',cityId: kinshasaCity.id},
            {name: 'Barumbu', cityId: kinshasaCity.id},
            {name: 'Kinshasa', cityId: kinshasaCity.id},
            {name: 'Kasa-Vubu', cityId: kinshasaCity.id},
            {name: 'Lemba', cityId: kinshasaCity.id},
            {name: 'Matete', cityId: kinshasaCity.id},
            {name: 'Ngaliema', cityId: kinshasaCity.id},
            {name: 'Ndjili', cityId: kinshasaCity.id},
            {name: 'Kalamu', cityId: kinshasaCity.id},
        ])
        .onConflictDoNothing()
        .returning();

    const allDistricts = insertedDistricts.length
        ? insertedDistricts
        : await db.select().from(districts);

    console.log(`✓ ${allDistricts.length} Districts`);

    const gombeDistrict = allDistricts.find(d => d.name === 'Gombe')!;

    const [existingSchool] = await db.select().from(schools)
        .where(eq(schools.code, 'GSJ-001'));

    const school = existingSchool ?? (await db.insert(schools).values({
        name: 'Groupe Scolaire Saint-Joseph',
        code: 'GSJ-001',
        email: 'contact@saintjoseph.cd',
        districtId: gombeDistrict.id,
    }).returning())[0];

    console.log('✓ School:', school.name);

    const [existingSubSchool] = await db.select().from(subSchools)
        .where(eq(subSchools.code, 'GSJ-GOMBE'));

    const subSchool = existingSubSchool ?? (await db.insert(subSchools).values({
        name: 'Saint-Joseph Gombe',
        code: 'GSJ-GOMBE',
        schoolId: school.id,
    }).returning())[0];

    console.log('✓ SubSchool:', subSchool.name);

    const sampleCourses = [
        { name: 'Mathématiques', code: 'MATH-01', description: 'Algèbre, géométrie et analyse', credits: 4, subSchoolId: subSchool.id },
        { name: 'Français', code: 'FR-01', description: 'Grammaire, littérature et expression écrite', credits: 4, subSchoolId: subSchool.id },
        { name: 'Physique-Chimie', code: 'PC-01', description: 'Mécanique, thermodynamique et chimie générale', credits: 3, subSchoolId: subSchool.id },
        { name: 'Biologie', code: 'BIO-01', description: 'Sciences de la vie et de la terre', credits: 3, subSchoolId: subSchool.id },
        { name: 'Histoire-Géographie', code: 'HG-01', description: 'Histoire du Congo et géographie mondiale', credits: 2, subSchoolId: subSchool.id },
        { name: 'Anglais', code: 'EN-01', description: 'Langue anglaise niveau secondaire', credits: 2, subSchoolId: subSchool.id },
        { name: 'Éducation Civique', code: 'EC-01', description: 'Citoyenneté et institutions', credits: 1, subSchoolId: subSchool.id },
        { name: 'Informatique', code: 'INFO-01', description: 'Bureautique et initiation à la programmation', credits: 2, subSchoolId: subSchool.id },
    ];

    for (const course of sampleCourses) {
        const [existing] = await db.select().from(courses)
            .where(and(eq(courses.code, course.code), eq(courses.subSchoolId, course.subSchoolId)));

        if (!existing) {
            await db.insert(courses).values(course);
            console.log(`✓ Course created: ${course.name}`);
        } else {
            console.log(`~ Course already exists: ${course.name}`);
        }
    }


    const sampleClasses = [
        { name: '1ère Année Secondaire A', gradeLevel: 'Secondaire 1', capacity: 35, subSchoolId: subSchool.id },
        { name: '1ère Année Secondaire B', gradeLevel: 'Secondaire 1', capacity: 35, subSchoolId: subSchool.id },
        { name: '2ème Année Secondaire A', gradeLevel: 'Secondaire 2', capacity: 30, subSchoolId: subSchool.id },
        { name: '3ème Année Secondaire A', gradeLevel: 'Secondaire 3', capacity: 30, subSchoolId: subSchool.id },
    ];

    for (const cls of sampleClasses) {
        const [existingClass] = await db.select().from(classes).where(
            and(eq(classes.name, cls.name), eq(classes.subSchoolId, cls.subSchoolId))
        );

        if (!existingClass) {
            await db.insert(classes).values(cls);
            console.log(`✓ Class created: ${cls.name}`);
        }
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const [existingAdmin] = await db.select().from(users)
        .where(eq(users.email, 'admin@saintjoseph.cd'));

    if (!existingAdmin) {
        const [worker] = await db.insert(workers).values({
            firstName: 'Admin',
            lastName: 'School',
            email: 'admin@saintjoseph.cd',
            subSchoolId: subSchool.id,
        }).returning();

        await db.insert(users).values({
            email: 'admin@saintjoseph.cd',
            password: hashedPassword,
            role: 'admin',
            workerId: worker.id,
        });

        console.log('✓ Admin user: admin@saintjoseph.cd');
    } else {
        console.log('~ Admin user already exists');
    }

    try {
        await db.delete(users).where(eq(users.email, 'marie.kabila@saintjoseph.cd'))
        console.log('✓ Deleted user')
        await db.delete(students).where(eq(students.email, 'marie.kabila@saintjoseph.cd'))
        console.log('✓ Deleted student')
    } catch(err) {
        console.error('Delete error:', err)
    }
    const [student] = await db.insert(students).values({
        firstName: 'Marie',
        lastName: 'Kabila',
        email: 'marie.kabila@saintjoseph.cd',
        gender: 'female',
        dateOfBirth: '2008-07-20',
        enrollmentDate: '2024-09-01',
        subSchoolId: subSchool.id,
    }).returning();

    await db.insert(users).values({
        email: 'marie.kabila@saintjoseph.cd',
        password: hashedPassword,
        role: 'student',
        studentId: student.id,
    });

    console.log('✓ Student user: marie.kabila@saintjoseph.cd')

    await db.delete(users).where(eq(users.email, 'paul.kabila@saintjoseph.cd')).catch(() => {});
    await db.delete(students).where(eq(students.email, 'paul.kabila@saintjoseph.cd')).catch(() => {});

    const [student2] = await db.insert(students).values({
        firstName: 'Paul',
        lastName: 'Kabila',
        email: 'paul.kabila@saintjoseph.cd',
        gender: 'male',
        dateOfBirth: '2010-03-15',
        enrollmentDate: '2024-09-01',
        subSchoolId: subSchool.id,
    }).returning();

    await db.insert(users).values({
        email: 'paul.kabila@saintjoseph.cd',
        password: hashedPassword,
        role: 'student',
        studentId: student2.id,
    });

    console.log('✓ Student 2: paul.kabila@saintjoseph.cd');

    await db.delete(users).where(eq(users.email, 'sophie.kabila@saintjoseph.cd')).catch(() => {});
    await db.delete(parents).where(eq(parents.email, 'sophie.kabila@saintjoseph.cd')).catch(() => {});

    const [parent] = await db.insert(parents).values({
        firstName: 'Sophie',
        lastName: 'Kabila',
        email: 'sophie.kabila@saintjoseph.cd',
        phone: '+243 81 111 2222',
        subSchoolId: subSchool.id,
    }).returning();

    await db.insert(users).values({
        email: 'sophie.kabila@saintjoseph.cd',
        password: hashedPassword,
        role: 'parent',
        parentId: parent.id,
    });
    console.log('✓ Parent user: sophie.kabila@saintjoseph.cd');

    await db.insert(parentStudents)
        .values([
            { parentId: parent.id, studentId: student.id },
            { parentId: parent.id, studentId: student2.id },
        ])
        .onConflictDoNothing();
    console.log('✓ Parent-students links created');

    await db.delete(users).where(eq(users.email, 'jean.muamba@saintjoseph.cd')).catch(() => {});
    await db.delete(teacherSchools).where(
        eq(teacherSchools.teacherId,
            db.select({ id: teachers.id })
                .from(teachers)
                .where(eq(teachers.email, 'jean.muamba@saintjoseph.cd'))
                .limit(1)
        )
    ).catch(() => {});
    await db.delete(teachers).where(eq(teachers.email, 'jean.muamba@saintjoseph.cd')).catch(() => {});

    const [existingTeacher] = await db.select().from(teachers)
        .where(eq(teachers.email, 'jean.muamba@saintjoseph.cd'));

    if (!existingTeacher) {
        const [teacher] = await db.insert(teachers).values({
            firstName: 'Jean',
            lastName: 'Muamba',
            email: 'jean.muamba@saintjoseph.cd',
            gender: 'male',
            dateOfBirth: '1985-03-15',
            phone: '+243 81 234 5678',
        }).returning();

        await db.insert(teacherSchools).values({
            teacherId: teacher.id,
            subSchoolId: subSchool.id,
            hireDate: '2020-09-01',
            qualification: 'Licence en Mathématiques',
            specialization: 'Mathématiques',
            isActive: true,
        });

        await db.insert(users).values({
            email: 'jean.muamba@saintjoseph.cd',
            password: hashedPassword,
            role: 'teacher',
            teacherId: teacher.id,
        });

        console.log('✓ Teacher user: jean.muamba@saintjoseph.cd');
    } else {
        console.log('~ Teacher already exists');
    }

    console.log('\n✓ Seed completed. Test credentials (password: password123):');
    console.log('  Admin   → admin@saintjoseph.cd');
    console.log('  Student → marie.kabila@saintjoseph.cd');
    console.log('  Teacher → jean.muamba@saintjoseph.cd');

    process.exit(0);
}

seed().catch((err) => {
    console.error('✗ Seed failed:', err);
    process.exit(1);
});