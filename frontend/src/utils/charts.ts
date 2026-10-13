import type { EChartsOption } from 'echarts'

export function getBloodSugarChartOption(data: {
  times: string[]
  values: number[]
}): EChartsOption {
  return {
    animationDuration: 700,
    animationEasing: 'cubicOut',
    grid: {
      top: 24,
      right: 22,
      bottom: data.times.length > 12 ? 64 : 34,
      left: 52,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#102a2e',
      borderWidth: 0,
      textStyle: { color: '#fff', fontSize: 12 },
      padding: [10, 12],
      formatter: (params: unknown) => {
        const rows = params as Array<{ axisValue: string; value: number }>
        const item = rows[0]
        if (!item) return ''
        return `${item.axisValue}<br/><b>${item.value}</b> mmol/L`
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.times,
      axisLine: { lineStyle: { color: '#dce7e5' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#7d908e',
        fontSize: 10,
        hideOverlap: true,
      },
    },
    yAxis: {
      type: 'value',
      min: 2,
      max: (value: { max: number }) => Math.max(14, Math.ceil(value.max + 1)),
      splitNumber: 5,
      name: 'mmol/L',
      nameTextStyle: { color: '#8b9b99', fontSize: 10, padding: [0, 0, 6, 0] },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#7d908e', fontSize: 10 },
      splitLine: { lineStyle: { color: '#edf2f1' } },
    },
    series: [
      {
        name: '血糖值',
        type: 'line',
        data: data.values,
        smooth: 0.32,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: data.values.length <= 16,
        lineStyle: { color: '#0f766e', width: 3 },
        itemStyle: {
          color: '#fff',
          borderColor: '#0f766e',
          borderWidth: 3,
        },
        emphasis: {
          scale: 1.4,
          itemStyle: { color: '#a3e635', borderColor: '#0b5f59' },
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(15, 118, 110, 0.24)' },
              { offset: 1, color: 'rgba(15, 118, 110, 0.015)' },
            ],
          },
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { type: 'dashed', width: 1 },
          label: {
            position: 'insideEndTop',
            color: '#7d908e',
            fontSize: 10,
            backgroundColor: '#fff',
            padding: [2, 4],
          },
          data: [
            { yAxis: 3.9, lineStyle: { color: '#d97706' }, label: { formatter: '低 3.9' } },
            { yAxis: 7.0, lineStyle: { color: '#65a30d' }, label: { formatter: '目标 7.0' } },
            { yAxis: 10.0, lineStyle: { color: '#e4574f' }, label: { formatter: '高 10.0' } },
          ],
        },
      },
    ],
    dataZoom: data.times.length > 12 ? [{ type: 'inside' }] : [],
  }
}

export function getHealthScoreOption(score: number): EChartsOption {
  const color = score >= 80 ? '#65a30d' : score >= 60 ? '#d97706' : '#e4574f'
  return {
    animationDuration: 900,
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        radius: '92%',
        center: ['50%', '61%'],
        splitNumber: 5,
        itemStyle: { color },
        progress: {
          show: true,
          width: 14,
          roundCap: true,
          itemStyle: {
            color,
            shadowBlur: 12,
            shadowColor: `${color}33`,
          },
        },
        pointer: { show: false },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 14,
            color: [[1, '#e9f0ef']],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        data: [{ value: score }],
      },
    ],
  }
}
