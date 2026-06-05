"use client";

import {
  Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const tooltipStyle = {
  background: "rgb(var(--sc-lowest))",
  border: "1px solid rgb(var(--outline-variant))",
  borderRadius: 12,
  color: "rgb(var(--on-surface))",
  fontSize: 13,
};

export interface DayPoint { day: string; servicios: number; ingresos: number }
export interface Slice { name: string; value: number; color: string }

export function ServicesLineChart({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="g-serv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0070ea" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#0070ea" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--outline-variant))" vertical={false} />
        <XAxis dataKey="day" stroke="rgb(var(--on-surface-variant))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="rgb(var(--on-surface-variant))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="servicios" stroke="#0070ea" strokeWidth={3} fill="url(#g-serv)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueBarChart({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--outline-variant))" vertical={false} />
        <XAxis dataKey="day" stroke="rgb(var(--on-surface-variant))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="rgb(var(--on-surface-variant))" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgb(var(--sc))" }} />
        <Bar dataKey="ingresos" fill="#002863" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ServiceTypeDonut({ data }: { data: Slice[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={3}>
          {data.map((d) => <Cell key={d.name} fill={d.color} stroke="transparent" />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
