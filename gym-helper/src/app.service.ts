import { Injectable } from '@nestjs/common';

type AuthMode = 'guest' | 'user';

type SessionViewModel = {
  authMode: AuthMode;
  authQuery: string;
  isAuthorized: boolean;
  actionHref: string;
  actionLabel: string;
  email?: string;
  name?: string;
  role?: string;
};

type NavItem = {
  href: string;
  isActive: boolean;
  label: string;
};

type FeatureCard = {
  description: string;
  href: string;
  meta: string;
  title: string;
};

type LabPageViewModel = {
  cards: FeatureCard[];
  intro: string;
  navItems: NavItem[];
  pageTitle: string;
  session: SessionViewModel;
  subtitle: string;
  title: string;
};

const SPA_LINKS = [
  {
    description:
      'Текущая React-страница с краткой статистикой и быстрыми переходами.',
    href: '/',
    meta: 'React SPA',
    title: 'Дашборд',
  },
  {
    description:
      'Недельный план тренировок, который читается и сохраняется через backend API.',
    href: '/plan',
    meta: 'План на неделю',
    title: 'План',
  },
  {
    description: 'Экран работы с упражнениями и сетами на конкретную дату.',
    href: '/workout/2026-04-07',
    meta: 'Маршрут с параметром даты',
    title: 'Тренировка',
  },
  {
    description: 'Учёт приёмов пищи и расчёт КБЖУ на выбранный день.',
    href: '/nutrition/2026-04-07',
    meta: 'Питание по дате',
    title: 'Питание',
  },
  {
    description: 'Запись сна и отдыха на выбранную дату через backend API.',
    href: '/rest/2026-04-07',
    meta: 'Сон и восстановление',
    title: 'Отдых',
  },
];

const EXERCISE_CARDS = [
  {
    description: 'Базовое упражнение на грудь, плечи и трицепс.',
    href: '/workout/2026-04-07',
    meta: 'Силовая база',
    title: 'Жим лежа',
  },
  {
    description: 'Ключевое упражнение для ног и общей силовой выносливости.',
    href: '/plan',
    meta: 'Ноги и корпус',
    title: 'Приседания',
  },
  {
    description: 'Тяговое движение на заднюю цепь и силу хвата.',
    href: '/workout/2026-04-07',
    meta: 'Тяговый день',
    title: 'Становая тяга',
  },
  {
    description: 'Вертикальная тяга с собственным весом для спины и бицепса.',
    href: '/plan',
    meta: 'Спина',
    title: 'Подтягивания',
  },
];

@Injectable()
export class AppService {
  getLabHomeViewModel(authParam?: string): LabPageViewModel {
    const session = this.buildSession(authParam, '/lab1');

    return this.buildPageModel({
      activeHref: '/lab1',
      cards: SPA_LINKS,
      intro:
        'Эта серверная страница существует специально для ЛР1 и показывает, что Nest умеет одновременно отдавать React SPA как статику и рендерить шаблоны на сервере.',
      pageTitle: 'ЛР1: Интеграция клиентской части',
      session,
      subtitle: 'Render + NestJS + статический React frontend',
      title: 'GymHelper внутри Nest-приложения',
    });
  }

  getLabExercisesViewModel(authParam?: string): LabPageViewModel {
    const session = this.buildSession(authParam, '/lab1/exercises');

    return this.buildPageModel({
      activeHref: '/lab1/exercises',
      cards: EXERCISE_CARDS,
      intro:
        'Здесь повторяющиеся карточки вынесены в отдельный partial, а переключение состояния сессии управляется query-параметром auth.',
      pageTitle: 'ЛР1: Шаблонизация страниц',
      session,
      subtitle: 'Повторяемые блоки и два состояния сессии',
      title: 'Демонстрационная шаблонная страница',
    });
  }

  private buildPageModel(input: {
    activeHref: string;
    cards: FeatureCard[];
    intro: string;
    pageTitle: string;
    session: SessionViewModel;
    subtitle: string;
    title: string;
  }): LabPageViewModel {
    return {
      cards: input.cards,
      intro: input.intro,
      navItems: this.buildNavItems(input.activeHref, input.session.authQuery),
      pageTitle: input.pageTitle,
      session: input.session,
      subtitle: input.subtitle,
      title: input.title,
    };
  }

  private buildNavItems(activeHref: string, authQuery: string): NavItem[] {
    return [
      {
        href: `/lab1${authQuery}`,
        isActive: activeHref === '/lab1',
        label: 'Шаблонная главная',
      },
      {
        href: `/lab1/exercises${authQuery}`,
        isActive: activeHref === '/lab1/exercises',
        label: 'Карточки упражнений',
      },
      {
        href: '/',
        isActive: false,
        label: 'React SPA',
      },
    ];
  }

  private buildSession(
    authParam: string | undefined,
    currentPath: string,
  ): SessionViewModel {
    const authMode: AuthMode = authParam === 'user' ? 'user' : 'guest';
    const authQuery = authMode === 'user' ? '?auth=user' : '?auth=guest';

    if (authMode === 'user') {
      return {
        actionHref: `${currentPath}?auth=guest`,
        actionLabel: 'Показать гостя',
        authMode,
        authQuery,
        email: 'mihail@gymhelper.local',
        isAuthorized: true,
        name: 'Mihail',
        role: 'admin',
      };
    }

    return {
      actionHref: `${currentPath}?auth=user`,
      actionLabel: 'Показать пользователя',
      authMode,
      authQuery,
      isAuthorized: false,
    };
  }
}
