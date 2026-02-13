import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Wifi, WifiOff, Bell, BellRing, X, BarChart3, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Mock data for SO₂ trend
const so2TrendData = [
  { time: "00:00", value: 45 },
  { time: "04:00", value: 52 },
  { time: "08:00", value: 68 },
  { time: "12:00", value: 78 },
  { time: "16:00", value: 65 },
  { time: "20:00", value: 55 },
  { time: "24:00", value: 48 },
];

// Mock data for AQI trend
const aqiTrendData = [
  { time: "00:00", value: 35 },
  { time: "04:00", value: 42 },
  { time: "08:00", value: 58 },
  { time: "12:00", value: 68 },
  { time: "16:00", value: 55 },
  { time: "20:00", value: 45 },
  { time: "24:00", value: 38 },
];

// Mock prediction data with confidence bands
const predictionData = [
  { hour: "Now", value: 45, upper: 49, lower: 41 },
  { hour: "+1h", value: 47, upper: 51, lower: 43 },
  { hour: "+2h", value: 52, upper: 56, lower: 48 },
  { hour: "+3h", value: 55, upper: 59, lower: 51 },
  { hour: "+4h", value: 58, upper: 62, lower: 54 },
  { hour: "+5h", value: 54, upper: 58, lower: 50 },
  { hour: "+6h", value: 48, upper: 52, lower: 44 },
];

// Mock alerts data
const alertsData = [
  {
    id: 1,
    time: "14:32",
    location: "Zone A",
    event: "High SO₂ Level",
    value: "78 ppm",
    status: "critical"
  },
  {
    id: 2,
    time: "14:15",
    location: "Zone B",
    event: "Temperature Rising",
    value: "38°C",
    status: "high"
  },
  {
    id: 3,
    time: "13:48",
    location: "Zone C",
    event: "Humidity Alert",
    value: "92%",
    status: "high"
  },
  {
    id: 4,
    time: "13:22",
    location: "Zone A",
    event: "AQI Threshold",
    value: "68 AQI",
    status: "medium"
  },
  {
    id: 5,
    time: "12:55",
    location: "Zone D",
    event: "Wind Speed Warning",
    value: "15 m/s",
    status: "low"
  },
];

// KPI Card Component
function KPICard({
  label,
  value,
  unit,
  status,
  trend,
  trendValue
}) {
  const statusColors = {
    good: {
      bg: "bg-gradient-to-br from-status-good/20 to-status-good/10",
      border: "border-status-good/30",
      icon: "text-status-good",
      label: "text-status-good/80",
      badge: "bg-status-good/10 text-status-good"},
    medium: {
      bg: "bg-gradient-to-br from-status-medium/20 to-status-medium/10",
      border: "border-status-medium/30",
      icon: "text-status-medium",
      label: "text-status-medium/80",
      badge: "bg-status-medium/10 text-status-medium"},
    high: {
      bg: "bg-gradient-to-br from-status-high/20 to-status-high/10",
      border: "border-status-high/30",
      icon: "text-status-high",
      label: "text-status-high/80",
      badge: "bg-status-high/10 text-status-high"},
    critical: {
      bg: "bg-gradient-to-br from-status-critical/20 to-status-critical/10",
      border: "border-status-critical/30",
      icon: "text-status-critical",
      label: "text-status-critical/80",
      badge: "bg-status-critical/10 text-status-critical"}};

  const trendColors = {
    up: "text-status-high",
    down: "text-status-good",
    stable: "text-muted-foreground"};

  const config = statusColors[status];
  const statusLabel = status === "good" ? "Normal" : status === "medium" ? "Elevated" : status === "high" ? "High" : "Critical";

  return (
    <div className={cn(
      "relative rounded-xl border backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-xl hover:border-accent/40 hover:-translate-y-0.5 group overflow-hidden bg-card min-w-[200px]",
      config.border
    )}>
      {/* Background gradient accent */}
      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent"></div>
      </div>

      {/* Live indicator for real-time sensors - moved to top left */}
      {(label === "Temperature" || label === "Humidity" || label === "Soil Moisture") && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-status-good/10 px-2 py-1 rounded-md border border-status-good/20">
          <div className="w-1.5 h-1.5 bg-status-good rounded-full animate-pulse"></div>
          <span className="text-[9px] font-bold text-status-good uppercase tracking-wider">LIVE</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3 mt-6">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {value}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{unit}</span>
          </div>
        </div>
        <div
          className={cn(
            "rounded-lg p-2.5 border flex-shrink-0 ml-2",
            config.badge,
            "border-current border-opacity-20"
          )}
        >
          {status === "good" || status === "medium" ? (
            <CheckCircle className={cn("w-5 h-5", config.icon)} />
          ) : (
            <AlertTriangle className={cn("w-5 h-5", config.icon)} />
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap",
          config.badge
        )}>
          {statusLabel}
        </span>
      </div>

      <div className={cn("flex items-center gap-1 font-semibold text-xs", trendColors[trend])}>
        {trend === "up" && <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />}
        {trend === "down" && <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />}
        {trend === "stable" && <div className="w-3.5 h-3.5 text-lg flex-shrink-0">→</div>}
        <span className="truncate">{trendValue}</span>
      </div>
    </div>
  );
}

// Simple Line Chart Component
function LineChart({
  data,
  title,
  color = "#06B6D4"}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;
  const avg = Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length);

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.value - minValue) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-card rounded-xl border border-border/60 p-8 shadow-md">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground/60 mt-1">Last 24 hours • Avg: <span className="font-semibold text-foreground">{avg} {title.includes("SO₂") ? "ppm" : "AQI"}</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground/60 font-medium">Range</p>
          <p className="text-sm font-bold text-foreground">{minValue} - {maxValue}</p>
        </div>
      </div>

      <div className="relative group bg-gradient-to-br from-muted/20 to-transparent rounded-lg p-4">
        <svg
          className="w-full"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          style={{ height: "280px" }}
        >
          {/* Enhanced Grid */}
          <defs>
            <linearGradient id={`chartGradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
            <filter id={`glow-${title}`}>
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines - horizontal */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.15" opacity="0.08" className="text-muted" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="currentColor" strokeWidth="0.15" opacity="0.08" className="text-muted" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="0.15" opacity="0.08" className="text-muted" />

          {/* Area under line with gradient */}
          <polygon
            points={`0,60 ${points} 100,60`}
            fill={`url(#chartGradient-${title})`}
            vectorEffect="non-scaling-stroke"
          />

          {/* Line with glow effect */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            filter={`url(#glow-${title})`}
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.value - minValue) / range) * 100;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="0.7"
                  fill={color}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Enhanced Labels */}
      <div className="flex justify-between text-xs font-semibold text-muted-foreground/70 mt-4 px-1">
        {data.map((d, i) => (
          i % Math.ceil(data.length / 5) === 0 && (
            <span key={i}>{d.time}</span>
          )
        ))}
      </div>
    </div>
  );
}

// Prediction Chart with Confidence Bands
function PredictionChart({ data }) {
  const maxValue = Math.max(...data.map((d) => d.upper));
  const minValue = Math.min(...data.map((d) => d.lower));
  const range = maxValue - minValue;

  const centerPoints = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.value - minValue) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const upperBand = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.upper - minValue) / range) * 100;
    return [x, y];
  });

  const lowerBand = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.lower - minValue) / range) * 100;
    return [x, y];
  });

  const bandPath =
    upperBand.map((p) => `${p[0]},${p[1]}`).join(" ") +
    " " +
    lowerBand.reverse().map((p) => `${p[0]},${p[1]}`).join(" ");

  return (
    <div className="bg-card rounded-xl border border-border/60 p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-1">
          SO₂ Level Prediction
        </h3>
        <p className="text-xs font-medium text-muted-foreground/60">
          Advanced 24-hour forecast with confidence bands
        </p>
      </div>

      <svg
        className="w-full"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        style={{ height: "350px" }}
      >
        <defs>
          <linearGradient id="predictionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>
          <filter id="predictionGlow">
            <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Confidence band with gradient */}
        <polygon
          points={bandPath}
          fill="url(#predictionGradient)"
          stroke="#06B6D4"
          strokeWidth="0.15"
          opacity="0.7"
          vectorEffect="non-scaling-stroke"
        />

        {/* Center line with glow */}
        <polyline
          points={centerPoints}
          fill="none"
          stroke="#06B6D4"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          filter="url(#predictionGlow)"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((d.value - minValue) / range) * 100;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="0.8"
                fill="#06B6D4"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={x}
                cy={y}
                r="1.5"
                fill="#06B6D4"
                vectorEffect="non-scaling-stroke"
                opacity="0.2"
              />
            </g>
          );
        })}
      </svg>

      <div className="flex justify-between text-xs font-medium text-muted-foreground/70 mt-6 px-1">
        {data.map((d, i) => (
          i % 2 === 0 && (
            <span key={i}>{d.hour}</span>
          )
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg p-4 border border-accent/20">
          <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
            Current Level
          </p>
          <p className="text-3xl font-bold text-accent">
            {data[0].value} <span className="text-sm text-muted-foreground">ppm</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-status-high/20 to-status-high/5 rounded-lg p-4 border border-status-high/20">
          <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
            Peak Expected
          </p>
          <p className="text-3xl font-bold text-status-high">
            {Math.max(...data.map((d) => d.value))} <span className="text-sm text-muted-foreground">ppm</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-status-good/20 to-status-good/5 rounded-lg p-4 border border-status-good/20">
          <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
            Confidence
          </p>
          <p className="text-3xl font-bold text-status-good">
            95<span className="text-sm text-muted-foreground">%</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Alerts Table
function AlertsTable({ data }) {
  const statusConfig = {
    critical: {
      bg: "bg-gradient-to-r from-status-critical/15 to-status-critical/5",
      text: "text-status-critical",
      badge: "bg-status-critical/15 text-status-critical border-status-critical/40",
      indicator: "bg-status-critical"},
    high: {
      bg: "bg-gradient-to-r from-status-high/15 to-status-high/5",
      text: "text-status-high",
      badge: "bg-status-high/15 text-status-high border-status-high/40",
      indicator: "bg-status-high"},
    medium: {
      bg: "bg-gradient-to-r from-status-medium/15 to-status-medium/5",
      text: "text-status-medium",
      badge: "bg-status-medium/15 text-status-medium border-status-medium/40",
      indicator: "bg-status-medium"},
    low: {
      bg: "bg-gradient-to-r from-accent/15 to-accent/5",
      text: "text-accent",
      badge: "bg-accent/15 text-accent border-accent/40",
      indicator: "bg-accent"}};

  return (
    <div className="bg-card rounded-xl border border-border/60 p-8 shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Status
              </th>
              <th className="text-left px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Time
              </th>
              <th className="text-left px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Location
              </th>
              <th className="text-left px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Event Description
              </th>
              <th className="text-left px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Value
              </th>
              <th className="text-left px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Severity Level
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {data.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "transition-all duration-200 hover:bg-muted/40 group border-l-4",
                  statusConfig[row.status].bg,
                  "border-l-" + row.status
                )}
              >
                <td className="px-4 py-4">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    statusConfig[row.status].indicator
                  )}></div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {row.time}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-block px-3 py-1.5 rounded-md bg-muted/50 text-xs font-semibold text-foreground">
                    {row.location}
                  </span>
                </td>
                <td className="px-4 py-4 text-foreground font-medium">
                  {row.event}
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono font-bold text-foreground text-sm">
                    {row.value}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border transition-all duration-200",
                      statusConfig[row.status].badge
                    )}
                  >
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-6 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wide mb-1">
            Total Events
          </p>
          <p className="text-lg font-bold text-foreground">{data.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wide mb-1">
            Critical
          </p>
          <p className="text-lg font-bold text-status-critical">
            {data.filter(d => d.status === "critical").length}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wide mb-1">
            High Priority
          </p>
          <p className="text-lg font-bold text-status-high">
            {data.filter(d => d.status === "high").length}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wide mb-1">
            Resolution Rate
          </p>
          <p className="text-lg font-bold text-status-good">92%</p>
        </div>
      </div>
    </div>
  );
}

// Statistics Dashboard Component
function StatisticsCard({ title, stats, icon: Icon }) {
  return (
    <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{title}</h3>
        {Icon && <Icon className="w-5 h-5 text-accent" />}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <p className="text-xl font-bold text-foreground">{stats.current}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Average</p>
          <p className="text-xl font-bold text-accent">{stats.avg}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Range</p>
          <p className="text-sm font-semibold text-foreground mt-1">
            <span className="text-status-good">{stats.min}</span>
            <span className="text-muted-foreground mx-1">-</span>
            <span className="text-status-high">{stats.max}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Historical Chart Component with Recharts
function HistoricalChart({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border/60 p-8 shadow-md">
        <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No historical data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md">
      <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSoil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#888', fontSize: 12 }}
            tickFormatter={(value) => value}
          />
          <YAxis tick={{ fill: '#888', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '8px'
            }}
            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
          />
          <Legend />
          <Area type="monotone" dataKey="temperature" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} name="Temperature (°C)" />
          <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHumidity)" strokeWidth={2} name="Humidity (%)" />
          <Area type="monotone" dataKey="soilMoisture" stroke="#10b981" fillOpacity={1} fill="url(#colorSoil)" strokeWidth={2} name="Soil Moisture (%)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Alert Notification Component
function AlertNotification({ alert, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
      <div className="bg-status-critical/10 border border-status-critical rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <BellRing className="w-5 h-5 text-status-critical animate-pulse" />
            <div>
              <p className="font-bold text-status-critical text-sm">Alert Triggered!</p>
              <p className="text-sm text-foreground mt-1">{alert.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // Backend API URL (change this to your backend server URL)
  const API_URL = "/api/sensors";
  
  // State for real-time sensor data
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    timestamp: new Date()
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("--:--");
  
  // Previous values for trend calculation
  const [previousData, setPreviousData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0
  });

  // New state for advanced features
  const [historicalData, setHistoricalData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const audioRef = useRef(null);
  
  // Fetch sensor data from backend
  const fetchSensorData = async () => {
    try {
      const response = await fetch(`${API_URL}/current`);
      if (response.ok) {
        const data = await response.json();
        
        // Store previous values for trend
        setPreviousData({
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          soilMoisture: sensorData.soilMoisture
        });
        
        setSensorData(data);
        setIsConnected(true);
        
        // Update last update time
        const now = new Date();
        setLastUpdate(now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }));

        // Check for threshold alerts
        checkAlerts(data);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setIsConnected(false);
    }
  };

  // Fetch historical data
  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`${API_URL}/history?hours=24&limit=50`);
      if (response.ok) {
        const data = await response.json();
        
        // Handle both API response formats (data.data or data.readings)
        const readings = data.data || data.readings || [];
        
        // Format data for charts
        const formattedData = readings.map(reading => ({
          time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          temperature: reading.temperature,
          humidity: reading.humidity,
          soilMoisture: reading.soilMoisture
        })).reverse(); // Reverse to show oldest first
        
        setHistoricalData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/stats?hours=24`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.stats);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Check for alerts
  const checkAlerts = (data) => {
    const newAlerts = [];
    
    if (data.temperature > 35) {
      newAlerts.push({
        id: Date.now(),
        type: 'HIGH_TEMPERATURE',
        message: `High Temperature Alert: ${data.temperature.toFixed(1)}°C detected!`,
        time: new Date().toLocaleTimeString()
      });
    }
    
    if (data.humidity < 30) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'LOW_HUMIDITY',
        message: `Low Humidity Alert: ${data.humidity.toFixed(1)}% detected!`,
        time: new Date().toLocaleTimeString()
      });
    }
    
    if (data.soilMoisture < 30) {
      newAlerts.push({
        id: Date.now() + 2,
        type: 'LOW_SOIL_MOISTURE',
        message: `Low Soil Moisture: ${data.soilMoisture.toFixed(0)}% detected!`,
        time: new Date().toLocaleTimeString()
      });
    }
    
    if (newAlerts.length > 0 && !activeAlert) {
      setActiveAlert(newAlerts[0]);
      playAlertSound();
    }
  };

  // Play alert sound
  const playAlertSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };
  // Calculate trend (up, down, stable)
  const getTrend = (current, previous) => {
    if (previous === 0) return "stable";
    const diff = current - previous;
    if (Math.abs(diff) < 1) return "stable";
    return diff > 0 ? "up" : "down";
  };
  
  // Calculate status based on thresholds
  const getTemperatureStatus = (temp) => {
    if (temp < 25) return "good";
    if (temp < 30) return "medium";
    if (temp < 35) return "high";
    return "critical";
  };
  
  const getHumidityStatus = (humidity) => {
    if (humidity >= 40 && humidity <= 70) return "good";
    if (humidity >= 30 && humidity <= 80) return "medium";
    if (humidity >= 20 && humidity <= 90) return "high";
    return "critical";
  };
  
  const getSoilMoistureStatus = (moisture) => {
    if (moisture >= 40 && moisture <= 70) return "good";
    if (moisture >= 30 && moisture <= 80) return "medium";
    if (moisture >= 15 && moisture < 30) return "high";
    return "critical";
  };
  
  // Fetch data on component mount and set interval
  useEffect(() => {
    // Initial fetch
    fetchSensorData();
    fetchHistoricalData();
    fetchStatistics();
    
    // Set up polling every 5 seconds for current data
    const interval = setInterval(fetchSensorData, 5000);
    
    // Fetch historical data every 30 seconds
    const historicalInterval = setInterval(fetchHistoricalData, 30000);
    
    // Fetch statistics every minute
    const statsInterval = setInterval(fetchStatistics, 60000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      clearInterval(historicalInterval);
      clearInterval(statsInterval);
    };
  }, []);
  
  return (
    <Layout>
      {/* Alert Notification */}
      {activeAlert && (
        <AlertNotification 
          alert={activeAlert} 
          onClose={() => setActiveAlert(null)} 
        />
      )}
      
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-background">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Air Quality Monitoring Dashboard
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              Real-time monitoring and predictive analytics • Last updated: {lastUpdate}
              {isConnected ? (
                <span className="flex items-center gap-1 text-status-good">
                  <Wifi className="w-4 h-4" />
                  <span className="font-semibold">Connected</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-status-high">
                  <WifiOff className="w-4 h-4" />
                  <span className="font-semibold">Disconnected</span>
                </span>
              )}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <select className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-1">
              Active Zones
            </p>
            <p className="text-2xl font-bold text-foreground">4</p>
            <p className="text-xs text-status-good mt-2">All operational</p>
          </div>
          <div className="bg-card rounded-lg border border-border/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-1">
              Critical Alerts
            </p>
            <p className="text-2xl font-bold text-status-critical">1</p>
            <p className="text-xs text-status-critical mt-2">Requires attention</p>
          </div>
          <div className="bg-card rounded-lg border border-border/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-1">
              System Health
            </p>
            <p className="text-2xl font-bold text-status-good">98%</p>
            <p className="text-xs text-status-good mt-2">Excellent</p>
          </div>
          <div className="bg-card rounded-lg border border-border/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-1">
              Data Points
            </p>
            <p className="text-2xl font-bold text-accent">12.4K</p>
            <p className="text-xs text-muted-foreground mt-2">Today</p>
          </div>
        </div>

        {/* KPI Cards Grid with Animation */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Current Measurements
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time sensor data across all monitored zones
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 auto-rows-fr">
            <KPICard
              label="Temperature"
              value={sensorData.temperature.toFixed(1)}
              unit="°C"
              status={getTemperatureStatus(sensorData.temperature)}
              trend={getTrend(sensorData.temperature, previousData.temperature)}
              trendValue={
                getTrend(sensorData.temperature, previousData.temperature) === "stable"
                  ? "Stable"
                  : `${Math.abs(sensorData.temperature - previousData.temperature).toFixed(1)}°C`
              }
            />
            <KPICard
              label="Humidity"
              value={sensorData.humidity.toFixed(1)}
              unit="%"
              status={getHumidityStatus(sensorData.humidity)}
              trend={getTrend(sensorData.humidity, previousData.humidity)}
              trendValue={
                getTrend(sensorData.humidity, previousData.humidity) === "stable"
                  ? "Stable"
                  : `${Math.abs(sensorData.humidity - previousData.humidity).toFixed(1)}%`
              }
            />
            <KPICard
              label="Soil Moisture"
              value={sensorData.soilMoisture.toFixed(0)}
              unit="%"
              status={getSoilMoistureStatus(sensorData.soilMoisture)}
              trend={getTrend(sensorData.soilMoisture, previousData.soilMoisture)}
              trendValue={
                getTrend(sensorData.soilMoisture, previousData.soilMoisture) === "stable"
                  ? "Stable"
                  : `${Math.abs(sensorData.soilMoisture - previousData.soilMoisture).toFixed(0)}%`
              }
            />
            <KPICard
              label="SO₂ Level"
              value="48"
              unit="ppm"
              status="medium"
              trend="down"
              trendValue="8.2% from peak"
            />
            <KPICard
              label="AQI"
              value="68"
              unit="Index"
              status="high"
              trend="down"
              trendValue="Improving"
            />
          </div>
        </div>

        {/* Statistics Dashboard */}
        {statistics && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  24-Hour Statistics Summary
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Min, Max, and Average values from MongoDB Atlas • {statistics.count} readings analyzed
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatisticsCard 
                title="Temperature"
                icon={Activity}
                stats={{
                  current: `${sensorData.temperature.toFixed(1)}°C`,
                  avg: `${statistics.avgTemperature.toFixed(1)}°C`,
                  min: `${statistics.minTemperature.toFixed(1)}°C`,
                  max: `${statistics.maxTemperature.toFixed(1)}°C`
                }}
              />
              <StatisticsCard 
                title="Humidity"
                icon={Activity}
                stats={{
                  current: `${sensorData.humidity.toFixed(1)}%`,
                  avg: `${statistics.avgHumidity.toFixed(1)}%`,
                  min: `${statistics.minHumidity.toFixed(1)}%`,
                  max: `${statistics.maxHumidity.toFixed(1)}%`
                }}
              />
              <StatisticsCard 
                title="Soil Moisture"
                icon={Activity}
                stats={{
                  current: `${sensorData.soilMoisture.toFixed(0)}%`,
                  avg: `${statistics.avgSoilMoisture.toFixed(1)}%`,
                  min: `${statistics.minSoilMoisture.toFixed(0)}%`,
                  max: `${statistics.maxSoilMoisture.toFixed(0)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Real Sensor Historical Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Real-Time Sensor Trends
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Live data from NodeMCU ESP8266 • Temperature, Humidity, Soil Moisture
              </p>
            </div>
          </div>
          <HistoricalChart 
            data={historicalData} 
            title="24-Hour Sensor Data History"
          />
        </div>

        {/* Charts Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Historical Analysis
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                24-hour trend analysis and comparative metrics
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart
              data={so2TrendData}
              title="SO₂ Level Trend"
              color="#06B6D4"
            />
            <LineChart
              data={aqiTrendData}
              title="Air Quality Index Trend"
              color="#3B82F6"
            />
          </div>
        </div>

        {/* Prediction Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Predictive Analytics
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                AI-powered forecasting with 95% confidence intervals
              </p>
            </div>
          </div>
          <PredictionChart data={predictionData} />
        </div>

        {/* Alerts Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Event Log
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                All critical alerts and pollution events • Sorted by severity and timestamp
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-accent border border-accent/20 rounded-lg hover:bg-accent/5 transition-colors">
              Export Report
            </button>
          </div>
          <AlertsTable data={alertsData} />
        </div>
      </div>
    </Layout>
  );
}
