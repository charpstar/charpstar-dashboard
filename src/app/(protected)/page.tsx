import { Card, ProgressBar } from "@tremor/react";
import AreaChartHero from "@/components/AreaChartHero";
import { DemoComponent } from "@/components/DatePicker";

export default async function Index() {
  return (
    <div className="h-lvh">
      <Card className="max-w-md">
        <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Sales
        </h4>
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          $71,465
        </p>
        <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          <span>32% of annual target</span>
          <span>$225,000</span>
        </p>

        <ProgressBar value={32} className="mt-2" />
      </Card>

      <AreaChartHero />
      <DemoComponent />
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600 h-32 md:h-64"></div>
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64"></div>
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64"></div>
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64"></div>
      </div>

      <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-96 mb-4"></div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
      </div>

      <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-96 mb-4"></div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
      </div>
    </>
  );
}
