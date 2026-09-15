import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { formatNumber, formatCurrency, formatPercentage } from '../../utils/formatters';
import states from '../../data/states';

const INDIA_GEOJSON_URL = 'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson';

const riskColors = {
  'Critical': '#ef4444',
  'High': '#f97316',
  'Moderate': '#f59e0b',
  'Low': '#22c55e',
};

const riskColorScale = (score) => {
  if (score >= 75) return '#ef4444';
  if (score >= 60) return '#f97316';
  if (score >= 40) return '#f59e0b';
  return '#22c55e';
};

const stateNameMapping = {
  'Andaman and Nicobar Islands': 'Andaman & Nicobar Islands',
  'Andhra Pradesh': 'Andhra Pradesh',
  'Arunachal Pradesh': 'Arunachal Pradesh',
  'Assam': 'Assam',
  'Bihar': 'Bihar',
  'Chandigarh': 'Chandigarh',
  'Chhattisgarh': 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu': 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi': 'Delhi',
  'Goa': 'Goa',
  'Gujarat': 'Gujarat',
  'Haryana': 'Haryana',
  'Himachal Pradesh': 'Himachal Pradesh',
  'Jammu and Kashmir': 'Jammu & Kashmir',
  'Jharkhand': 'Jharkhand',
  'Karnataka': 'Karnataka',
  'Kerala': 'Kerala',
  'Ladakh': 'Ladakh',
  'Lakshadweep': 'Lakshadweep',
  'Madhya Pradesh': 'Madhya Pradesh',
  'Maharashtra': 'Maharashtra',
  'Manipur': 'Manipur',
  'Meghalaya': 'Meghalaya',
  'Mizoram': 'Mizoram',
  'Nagaland': 'Nagaland',
  'Odisha': 'Odisha',
  'Puducherry': 'Puducherry',
  'Punjab': 'Punjab',
  'Rajasthan': 'Rajasthan',
  'Sikkim': 'Sikkim',
  'Tamil Nadu': 'Tamil Nadu',
  'Telangana': 'Telangana',
  'Tripura': 'Tripura',
  'Uttar Pradesh': 'Uttar Pradesh',
  'Uttarakhand': 'Uttarakhand',
  'West Bengal': 'West Bengal',
  'NCT of Delhi': 'Delhi',
};

export default function IndiaRiskMap({ onStateSelect, height = 420 }) {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [selectedState, setSelectedState] = useState(null);
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch(INDIA_GEOJSON_URL)
      .then(r => r.json())
      .then(data => setGeoData(data))
      .catch(() => {
        console.warn('Could not load India GeoJSON');
      });
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const h = height;

    const projection = d3.geoMercator()
      .center([82, 23])
      .scale(Math.min(width, h) * 1.4)
      .translate([width / 2, h / 2]);

    const path = d3.geoPath().projection(projection);
    const tooltip = d3.select(tooltipRef.current);

    const getStateData = (name) => {
      const mapped = stateNameMapping[name] || name;
      return states.find(s => s.name === mapped);
    };

    const g = svg.append('g');

    g.selectAll('path')
      .data(geoData.features)
      .join('path')
      .attr('d', path)
      .attr('fill', d => {
        const sd = getStateData(d.properties.ST_NM);
        return sd ? riskColorScale(sd.riskScore) : '#e2e8f0';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.8)
      .attr('cursor', 'pointer')
      .attr('opacity', 0.85)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1).attr('stroke-width', 2).attr('stroke', '#1B2A4A');
        const sd = getStateData(d.properties.ST_NM);
        const name = stateNameMapping[d.properties.ST_NM] || d.properties.ST_NM;
        tooltip
          .style('display', 'block')
          .style('left', (event.offsetX + 12) + 'px')
          .style('top', (event.offsetY - 10) + 'px')
          .html(`
            <div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#1e293b">${name}</div>
            ${sd ? `
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:11px">
                <span style="color:#64748b">Projects:</span><span style="font-weight:600;color:#1e293b">${formatNumber(sd.projects)}</span>
                <span style="color:#64748b">High Risk:</span><span style="font-weight:600;color:#ef4444">${sd.highRiskProjects}</span>
                <span style="color:#64748b">Risk Index:</span><span style="font-weight:600;color:${riskColorScale(sd.riskScore)}">${sd.riskScore}</span>
                <span style="color:#64748b">Completion:</span><span style="font-weight:600;color:#1e293b">${sd.completion}%</span>
              </div>
            ` : '<span style="color:#94a3b8;font-size:11px">No data available</span>'}
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.offsetX + 12) + 'px')
          .style('top', (event.offsetY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.85).attr('stroke-width', 0.8).attr('stroke', '#fff');
        tooltip.style('display', 'none');
      })
      .on('click', function(event, d) {
        const sd = getStateData(d.properties.ST_NM);
        if (sd) {
          setSelectedState(sd);
          onStateSelect?.(sd);
        }
      });
  }, [geoData, height, onStateSelect]);

  return (
    <div className="relative">
      <div className="relative" style={{ height }}>
        {!geoData ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-navy-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading India Map...</p>
            </div>
          </div>
        ) : (
          <>
            <svg ref={svgRef} width="100%" height={height} className="select-none" />
            <div
              ref={tooltipRef}
              className="absolute pointer-events-none bg-white rounded-lg shadow-xl border border-slate-200 px-4 py-3 z-20"
              style={{ display: 'none', maxWidth: '220px' }}
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
      </div>

      {/* Selected State Panel */}
      {selectedState && (
        <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">{selectedState.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              selectedState.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
              selectedState.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
              selectedState.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-700' :
              'bg-green-100 text-green-700'
            }`}>
              {selectedState.riskLevel} Risk
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Projects', value: formatNumber(selectedState.projects) },
              { label: 'Funds', value: formatCurrency(selectedState.funds * 100000) },
              { label: 'Completion', value: `${selectedState.completion}%` },
              { label: 'High Risk', value: selectedState.highRiskProjects },
              { label: 'Risk Index', value: selectedState.riskScore },
              { label: 'Delay Rate', value: `${selectedState.delayRate}%` },
            ].map(m => (
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
