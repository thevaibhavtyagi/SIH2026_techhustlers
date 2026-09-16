import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { formatNumber, formatCurrency } from '../../utils/formatters';
import { riskApi } from '../../services/api';

// GeoJSON fetched from a trusted public CDN at runtime.
// Property used to identify states: d.properties.ST_NM
const INDIA_GEOJSON_URL =
  'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson';

// ──────────────────────────────────────────────────────────────
// Risk color scale — matches Step 5 semantics (0–100 score)
// ──────────────────────────────────────────────────────────────
const riskColors = {
  'Critical': '#ef4444',
  'High':     '#f97316',
  'Moderate': '#f59e0b',
  'Low':      '#22c55e',
};

const riskColorScale = (score) => {
  if (score >= 75) return '#ef4444';
  if (score >= 60) return '#f97316';
  if (score >= 40) return '#f59e0b';
  return '#22c55e';
};

const riskLevelLabel = (score) => {
  if (score >= 75) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
};

// ──────────────────────────────────────────────────────────────
// State name normalization
//
// The GeoJSON uses `ST_NM` property — the values below are the
// exact strings from that file. The API dataset uses slightly
// different conventions. Both are normalised to a lowercase
// key so we can do case-insensitive matching.
//
// Normalisation pipeline:
//   GeoJSON ST_NM  ──► normalise() ──► lookup in stateIndex
//   API state name ──► normalise() ──► key in stateIndex
// ──────────────────────────────────────────────────────────────
const normalise = (name) =>
  (name || '')
    .toLowerCase()
    .replace(/&/g, 'and')          // "Jammu & Kashmir" → "jammu and kashmir"
    .replace(/\s+/g, ' ')          // collapse whitespace
    .trim();

// Maps known GeoJSON ST_NM quirks → what our normalized form would match.
// Only add entries where normalise() alone is not sufficient.
const GEOJSON_ALIAS = {
  // GeoJSON name                      API dataset name (post-normalise)
  'nct of delhi':                      'delhi',
  'andaman & nicobar island':          'andaman and nicobar islands',
  'andaman and nicobar island':        'andaman and nicobar islands',
  'daman & diu':                       'dadra and nagar haveli and daman and diu',
  'dadra & nagar haveli':              'dadra and nagar haveli and daman and diu',
  'dadra and nagar haveli':            'dadra and nagar haveli and daman and diu',
  'jammu & kashmir':                   'jammu and kashmir',
};

const resolveGeoName = (stNm) => {
  const n = normalise(stNm);
  return GEOJSON_ALIAS[n] || n;
};

export default function IndiaRiskMap({ onStateSelect, height = 420 }) {
  const svgRef      = useRef();
  const tooltipRef  = useRef();
  const [selectedState, setSelectedState]   = useState(null);
  const [geoData, setGeoData]               = useState(null);
  // stateIndex: { normalisedName → transformed state record from API }
  const [stateIndex, setStateIndex]         = useState({});
  const [apiLoading, setApiLoading]         = useState(true);
  const [apiError,   setApiError]           = useState(null);

  // ── 1. Fetch real state analytics from backend ────────────────
  useEffect(() => {
    setApiLoading(true);
    riskApi.getAnalyticsStates()
      .then((data) => {
        // Backend returns { states: [...], total_states: n } wrapped in
        // the Step 9 envelope; riskApi unwraps to data.data which is
        // { states: [...] } after the Express transformer.
        const list = data?.states || (Array.isArray(data) ? data : []);

        // Build a fast lookup keyed by normalised state name.
        const index = {};
        list.forEach((s) => {
          const key = normalise(s.state || '');
          index[key] = s;
        });
        setStateIndex(index);
      })
      .catch((err) => {
        console.error('[IndiaRiskMap] analytics/states error:', err?.message);
        setApiError('Could not load state risk data.');
      })
      .finally(() => setApiLoading(false));
  }, []);

  // ── 2. Fetch GeoJSON ─────────────────────────────────────────
  useEffect(() => {
    fetch(INDIA_GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => setGeoData(data))
      .catch(() => {
        console.warn('[IndiaRiskMap] Could not load India GeoJSON from CDN.');
      });
  }, []);

  // ── 3. Render D3 map whenever both data sources are ready ─────
  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg   = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 600;
    const h     = height;

    const projection = d3
      .geoMercator()
      .center([82, 23])
      .scale(Math.min(width, h) * 1.4)
      .translate([width / 2, h / 2]);

    const path    = d3.geoPath().projection(projection);
    const tooltip = d3.select(tooltipRef.current);

    // Lookup helper: GeoJSON ST_NM → API state record (or null)
    const getStateRecord = (stNm) => {
      const key = resolveGeoName(stNm);
      return stateIndex[key] || null;
    };

    const g = svg.append('g');

    g.selectAll('path')
      .data(geoData.features)
      .join('path')
      .attr('d', path)
      .attr('fill', (d) => {
        const sd = getStateRecord(d.properties.ST_NM);
        // Use averageRiskScore from API; grey if no data match
        return sd ? riskColorScale(sd.averageRiskScore ?? 0) : '#e2e8f0';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.8)
      .attr('cursor', 'pointer')
      .attr('opacity', 0.85)
      // ── Hover ──────────────────────────────────────────────────
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 2)
          .attr('stroke', '#1B2A4A');

        const stNm = d.properties.ST_NM;
        const sd   = getStateRecord(stNm);
        // Display name: prefer API state name (correct casing), else GeoJSON name
        const displayName = sd?.state || stNm;

        tooltip
          .style('display', 'block')
          .style('left', (event.offsetX + 14) + 'px')
          .style('top',  (event.offsetY - 10) + 'px')
          .html(
            sd
              ? `<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#1e293b">${displayName}</div>
                 <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:11px">
                   <span style="color:#64748b">Projects:</span>
                   <span style="font-weight:600;color:#1e293b">${formatNumber(sd.totalProjects ?? 0)}</span>
                   <span style="color:#64748b">High Risk:</span>
                   <span style="font-weight:600;color:#f97316">${sd.highRisk ?? 0}</span>
                   <span style="color:#64748b">Critical:</span>
                   <span style="font-weight:600;color:#ef4444">${sd.criticalRisk ?? 0}</span>
                   <span style="color:#64748b">Avg Risk Score:</span>
                   <span style="font-weight:600;color:${riskColorScale(sd.averageRiskScore ?? 0)}">${Math.round(sd.averageRiskScore ?? 0)}</span>
                 </div>`
              : `<div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#1e293b">${stNm}</div>
                 <span style="color:#94a3b8;font-size:11px">No project data available</span>`
          );
      })
      .on('mousemove', function (event) {
        tooltip
          .style('left', (event.offsetX + 14) + 'px')
          .style('top',  (event.offsetY - 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .attr('opacity', 0.85)
          .attr('stroke-width', 0.8)
          .attr('stroke', '#fff');
        tooltip.style('display', 'none');
      })
      // ── Click ──────────────────────────────────────────────────
      .on('click', function (event, d) {
        const stNm = d.properties.ST_NM;
        const sd   = getStateRecord(stNm);
        if (sd) {
          const enriched = {
            ...sd,
            // Normalised fields for the selected-state panel
            name:            sd.state,
            riskScore:       Math.round(sd.averageRiskScore ?? 0),
            riskLevel:       riskLevelLabel(sd.averageRiskScore ?? 0),
            projects:        sd.totalProjects ?? 0,
            highRiskProjects: (sd.highRisk ?? 0) + (sd.criticalRisk ?? 0),
            funds:           (sd.totalSanctionedAmount ?? 0) / 100000, // convert to Lakhs for formatCurrency usage
            totalExpenditure: sd.totalExpenditure ?? 0,
          };
          setSelectedState(enriched);
          onStateSelect?.(enriched);
        }
      });

  // Re-render whenever stateIndex updates (so colors refresh after API loads)
  }, [geoData, stateIndex, height, onStateSelect]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="relative">
      {apiError && (
        <div className="mb-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg">
          {apiError} Showing map without risk coloring.
        </div>
      )}

      <div className="relative" style={{ height }}>
        {!geoData ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-navy-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading India Map…</p>
            </div>
          </div>
        ) : (
          <>
            {/* Loading overlay for API data — map still renders, colors update when data arrives */}
            {apiLoading && (
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 text-xs text-slate-400 bg-white/80 px-2 py-1 rounded-full border border-slate-100">
                <div className="w-3 h-3 border-2 border-slate-300 border-t-navy-600 rounded-full animate-spin" />
                Loading risk data…
              </div>
            )}
            <svg ref={svgRef} width="100%" height={height} className="select-none" />
            <div
              ref={tooltipRef}
              className="absolute pointer-events-none bg-white rounded-lg shadow-xl border border-slate-200 px-4 py-3 z-20"
              style={{ display: 'none', maxWidth: '240px' }}
            />
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        {Object.entries(riskColors).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-600">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-200" />
          <span className="text-xs text-slate-400">No Data</span>
        </div>
      </div>

      {/* Selected State Panel — uses real API fields */}
      {selectedState && (
        <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">{selectedState.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              selectedState.riskLevel === 'Critical' ? 'bg-red-100 text-red-700'     :
              selectedState.riskLevel === 'High'     ? 'bg-orange-100 text-orange-700' :
              selectedState.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-700'  :
              'bg-green-100 text-green-700'
            }`}>
              {selectedState.riskLevel} Risk
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Projects',      value: formatNumber(selectedState.projects) },
              { label: 'Sanctioned',    value: formatCurrency(selectedState.totalSanctionedAmount ?? 0) },
              { label: 'Expenditure',   value: formatCurrency(selectedState.totalExpenditure ?? 0) },
              { label: 'High Risk',     value: selectedState.highRisk ?? 0 },
              { label: 'Critical Risk', value: selectedState.criticalRisk ?? 0 },
              { label: 'Avg Risk Score',value: selectedState.riskScore },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-lg p-2.5 border border-slate-100">
                <p className="text-sm font-bold text-slate-800">{m.value}</p>
                <p className="text-[10px] text-slate-500">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
