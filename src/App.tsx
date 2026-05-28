import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Cat,
  Heart,
  ImagePlus,
  Monitor,
  Moon,
  QrCode,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { applyDynamicTheme } from "@/theme";

const productTabs = {
  archive: {
    label: "档案",
    src: "/screenshots/档案.png",
    alt: "笃行猫谱档案页面截图",
    description: "资料卡、相册、精选瀑布流和关系图帮助用户认识每只猫的状态和故事。",
  },
  social: {
    label: "互动",
    src: "/screenshots/互动.png",
    alt: "笃行猫谱互动页面截图",
    description: "上传、点赞、留言、反馈和关注动态，让社群可以持续补充信息。",
  },
  tools: {
    label: "工具",
    src: "/screenshots/工具.png",
    alt: "笃行猫谱工具页面截图",
    description: "拍照识猫、科普、公告、徽章和排行榜用于扩展运营玩法。",
  },
} as const;

type ProductTab = keyof typeof productTabs;
type ThemePreference = "system" | "light" | "dark";

const productTabOrder: ProductTab[] = ["archive", "social", "tools"];

const features = [
  {
    icon: Cat,
    title: "猫猫档案",
    description: "为校园猫猫建立资料卡、相册和精选照片流，持续记录成长轨迹。",
  },
  {
    icon: ImagePlus,
    title: "照片共建",
    description: "用户可以上传照片、点赞、留言和反馈，让资料持续由社区维护。",
  },
  {
    icon: Camera,
    title: "拍照识猫",
    description: "支持通过图片识别相似猫咪，帮助新同学快速认识校园里的熟面孔。",
  },
  {
    icon: ShieldCheck,
    title: "端内管理",
    description: "资料管理、照片审核、反馈处理都能在小程序端完成，适合社团协作。",
  },
];

const stats = [
  ["5", "核心标签页"],
  ["40+", "功能页面"],
  ["15+", "友校实践"],
  ["0", "管理端门槛"],
];

const themeOptions = [
  { value: "system", label: "跟随系统", icon: Monitor },
  { value: "light", label: "浅色模式", icon: Sun },
  { value: "dark", label: "深色模式", icon: Moon },
] as const;

const getStoredThemePreference = (): ThemePreference => {
  try {
    const storedTheme = window.localStorage?.getItem("theme-preference");
    return storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system";
  } catch {
    return "system";
  }
};

function App() {
  const [activeProductTab, setActiveProductTab] = useState<ProductTab>("archive");
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>(getStoredThemePreference);
  const moreMenuTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const activeProductIndex = productTabOrder.indexOf(activeProductTab);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const shouldUseDark = themePreference === "dark" || (themePreference === "system" && mediaQuery.matches);
      applyDynamicTheme(shouldUseDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", shouldUseDark);
      document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
    };

    try {
      window.localStorage?.setItem("theme-preference", themePreference);
    } catch {
      // Theme switching should keep working even when storage is unavailable.
    }
    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);

    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [themePreference]);

  const updateActiveProductTab = (value: string) => {
    const nextTab = value as ProductTab;
    const currentIndex = productTabOrder.indexOf(activeProductTab);
    const nextIndex = productTabOrder.indexOf(nextTab);

    if (currentIndex !== nextIndex) {
      setSlideDirection(nextIndex > currentIndex ? "next" : "prev");
      setActiveProductTab(nextTab);
    }
  };

  const openMoreMenu = () => {
    if (moreMenuTimer.current) {
      window.clearTimeout(moreMenuTimer.current);
      moreMenuTimer.current = null;
    }

    setIsMoreOpen(true);
  };

  const closeMoreMenu = () => {
    moreMenuTimer.current = window.setTimeout(() => {
      setIsMoreOpen(false);
      moreMenuTimer.current = null;
    }, 180);
  };

  const scrollDownOnePage = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen">
      <section className="hero-bg relative z-10 min-h-[88vh] overflow-visible text-white">
        <div className="container flex min-h-[88vh] flex-col justify-between py-6">
          <nav className="flex items-center justify-between gap-4">
            <a className="flex items-center gap-2 text-sm font-semibold" href="#top" aria-label="笃行猫谱首页">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-slate-950">
                <Cat className="h-5 w-5" />
              </span>
              笃行猫谱
            </a>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-6 text-sm text-white/82 md:flex">
                <a className="hover:text-white" href="#features">功能</a>
                <a className="hover:text-white" href="#deploy">部署</a>
                <a className="hover:text-white" href="#community">共建</a>
              </div>
              <div className="relative">
                <button
                  aria-expanded={isThemeOpen}
                  aria-haspopup="dialog"
                  aria-label="切换颜色模式"
                  className="nav-icon-button"
                  onClick={() => setIsThemeOpen((open) => !open)}
                  type="button"
                >
                  {themePreference === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : themePreference === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Monitor className="h-4 w-4" />
                  )}
                </button>
                <div
                  className="hero-popover right-0 top-[calc(100%+0.65rem)] p-2"
                  data-open={isThemeOpen}
                  role="dialog"
                  aria-label="颜色模式选择"
                >
                  <div className="theme-toggle" aria-label="颜色模式">
                    {themeOptions.map((option) => (
                      <button
                        aria-pressed={themePreference === option.value}
                        className="theme-toggle-button"
                        data-active={themePreference === option.value}
                        data-theme-option={option.value}
                        key={option.value}
                        onClick={() => {
                          setThemePreference(option.value);
                          setIsThemeOpen(false);
                        }}
                        title={option.label}
                        type="button"
                      >
                        <option.icon className="h-3.5 w-3.5" />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div id="top" className="max-w-3xl pb-24 pt-14 md:pb-32 md:pt-16">
            <Badge className="mb-6 bg-white/14 text-white backdrop-blur" variant="outline">
              微信小程序 · 校园猫猫成长档案
            </Badge>
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-normal md:text-7xl">
              笃行猫谱
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/88 md:text-xl">
              拍照记录校园内猫猫的成长轨迹。用档案、相册、识猫、科普和端内管理，把分散在校园里的照护记忆整理成一份长期可维护的猫谱。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div
                className="relative"
                onMouseEnter={() => setIsQrOpen(true)}
                onMouseLeave={() => setIsQrOpen(false)}
              >
                <Button asChild size="lg">
                  <a href="#experience" aria-describedby="hero-qrcode-popover">
                    扫码体验
                    <QrCode className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <div
                  id="hero-qrcode-popover"
                  className="hero-popover left-0 top-[calc(100%+0.75rem)] w-48 p-3"
                  data-open={isQrOpen}
                >
                  <img className="rounded-md border bg-white p-2" src="/qrcode.png" alt="笃行猫谱小程序二维码" />
                  <p className="mt-2 text-center text-xs text-muted-foreground">微信扫码体验</p>
                </div>
              </div>

              <div
                className="relative"
                onMouseEnter={openMoreMenu}
                onMouseLeave={closeMoreMenu}
              >
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={scrollDownOnePage}
                  aria-haspopup="menu"
                  aria-expanded={isMoreOpen}
                >
                  了解更多
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200" data-open={isMoreOpen} />
                </Button>
                <div
                  className="hero-popover left-0 top-[calc(100%+0.75rem)] w-64 overflow-hidden p-2"
                  data-open={isMoreOpen}
                  role="menu"
                >
                  <a
                    className="hero-menu-item"
                    href="https://github.com/sysucats/zhongdamaopu#"
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                  >
                    源代码仓库
                    <span>sysucats/zhongdamaopu</span>
                  </a>
                  <a
                    className="hero-menu-item"
                    href="https://docs.qq.com/doc/DSE1vd0p3RERvWXJS"
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                  >
                    部署文档
                    <span>EMAS 版部署说明</span>
                  </a>
                  <a
                    className="hero-menu-item"
                    href="https://docs.qq.com/doc/DSEl0aENOSEx5cmtE"
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                  >
                    管理员手册
                    <span>小程序端资料管理</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-card py-2.5">
        <div className="container grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="py-3">
              <div className="text-3xl font-semibold">{value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container">
          <div className="max-w-2xl">
            <Badge variant="secondary">核心能力</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal md:text-4xl">
              从记录到管理，围绕校园猫日常照护展开
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border bg-card">
                <CardHeader>
                  <feature.icon className="h-7 w-7 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge variant="outline">项目截图</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal md:text-4xl">
              小程序优先，为真实运营场景设计
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              首页、照片流、科普文章、排行榜和个人中心形成完整访问路径；审核、资料维护、管理员协作等工作也保留在小程序内完成。
            </p>
            <Tabs
              value={activeProductTab}
              onValueChange={updateActiveProductTab}
              className="mt-8 w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                {(Object.entries(productTabs) as [ProductTab, (typeof productTabs)[ProductTab]][]).map(
                  ([value, tab]) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="tab-trigger-motion"
                      data-slide={slideDirection}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ),
                )}
              </TabsList>
              <div className="relative mt-2 min-h-14 overflow-hidden">
                {(Object.entries(productTabs) as [ProductTab, (typeof productTabs)[ProductTab]][]).map(
                  ([value, tab]) => {
                    const tabIndex = productTabOrder.indexOf(value);
                    const position =
                      tabIndex === activeProductIndex ? "active" : tabIndex < activeProductIndex ? "before" : "after";

                    return (
                      <p
                        aria-hidden={value !== activeProductTab}
                        data-position={position}
                        data-slide={slideDirection}
                        key={value}
                        className="tab-panel-motion text-sm leading-7 text-muted-foreground"
                      >
                        {tab.description}
                      </p>
                    );
                  },
                )}
              </div>
            </Tabs>
          </div>
          <div className="mx-auto flex w-full justify-center">
            <Card className="w-fit max-w-full bg-card shadow-soft">
              <CardContent className="p-3">
                <div className="screenshot-frame">
                  {(Object.entries(productTabs) as [ProductTab, (typeof productTabs)[ProductTab]][]).map(
                    ([value, tab]) => {
                      const tabIndex = productTabOrder.indexOf(value);
                      const position =
                        tabIndex === activeProductIndex ? "active" : tabIndex < activeProductIndex ? "before" : "after";

                      return (
                        <img
                          aria-hidden={value !== activeProductTab}
                          className="screenshot-image"
                          data-position={position}
                          data-slide={slideDirection}
                          key={value}
                          src={tab.src}
                          alt={tab.alt}
                        />
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="experience" className="py-20">
        <div className="container grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="max-w-md">
            <Badge variant="secondary">体验入口</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal md:text-4xl">
              打开微信，搜索或扫码进入
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              当前线上小程序名为“笃行猫谱”。如果你正在为自己的校园或社群准备猫谱，可以先体验完整用户路径。
            </p>
          </div>
          <Card className="mx-auto w-full max-w-sm bg-card">
            <CardHeader className="items-center text-center">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                笃行猫谱
              </CardTitle>
              <CardDescription>微信扫码体验小程序</CardDescription>
            </CardHeader>
            <CardContent>
              <img className="mx-auto w-56 rounded-md border bg-white p-2" src="/qrcode.png" alt="笃行猫谱小程序二维码" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="deploy" className="bg-card py-20">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Badge variant="outline">部署说明</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal md:text-4xl">
                从开源代码开始，发布自己的猫谱
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                小程序主体使用微信小程序、EMAS Serverless 和对象存储。介绍页本身是独立静态站点，可直接部署到 Vercel 或 Netlify。
              </p>
            </div>
            <Accordion type="single" collapsible defaultValue="" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>介绍页如何部署到 Vercel？</AccordionTrigger>
                <AccordionContent>
                  导入仓库后将 Root Directory 设置为 intro-page，Build Command 使用 npm run build，Output Directory 使用 dist。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>介绍页如何部署到 Netlify？</AccordionTrigger>
                <AccordionContent>
                  Netlify 会读取 intro-page/netlify.toml；站点根目录选择 intro-page，构建命令为 npm run build，发布目录为 dist。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>小程序部署需要哪些资料？</AccordionTrigger>
                <AccordionContent>
                  README 中提供了猫谱 EMAS 版部署文档和管理员手册，适合按步骤配置后端、存储、数据库和端内管理流程。
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <section id="community" className="py-20">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-card">
              <CardHeader>
                <Users className="h-7 w-7 text-[hsl(var(--support-a))]" />
                <CardTitle>适合社团协作</CardTitle>
                <CardDescription>管理员、审核员和普通用户可以在不同权限下参与维护。</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card">
              <CardHeader>
                <Heart className="h-7 w-7 text-[hsl(var(--support-b))]" />
                <CardTitle>围绕照护记录</CardTitle>
                <CardDescription>照片、疫苗、反馈和公告让猫猫状态更容易被持续关注。</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card">
              <CardHeader>
                <BadgeCheck className="h-7 w-7 text-[hsl(var(--support-c))]" />
                <CardTitle>已有多校实践</CardTitle>
                <CardDescription><a href="https://github.com/sysucats/zhongdamaopu#%E6%9C%8B%E5%8F%8B%E4%BB%AC%E7%9A%84%E5%B0%8F%E7%A8%8B%E5%BA%8F" target="_blank" rel="noreferrer" className="underline hover:no-underline">源代码仓库</a>记录了多所高校和社群的猫谱小程序案例。</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-10 text-white">
        <div className="container">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />
                笃行猫谱
              </div>
              <p className="mt-2 text-sm text-white/64">拍照记录校园内猫猫的成长轨迹。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <a href="https://docs.qq.com/doc/DSE1vd0p3RERvWXJS" target="_blank" rel="noreferrer">
                  部署文档
                </a>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <a href="https://docs.qq.com/doc/DSEl0aENOSEx5cmtE" target="_blank" rel="noreferrer">
                  管理员手册
                </a>
              </Button>
            </div>
          </div>
          <Separator className="my-8 bg-white/14" />
          <p className="text-xs text-white/50">基于<a href="https://github.com/sysucats/zhongdamaopu" target="_blank" rel="noreferrer" className="underline hover:no-underline">中大猫谱开源项目</a>构建。</p>
        </div>
      </footer>
    </main>
  );
}

export default App;
