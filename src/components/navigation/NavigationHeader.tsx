import { useMapStore } from '../../store/mapStore';

export function NavigationHeader() {
  const navigationState = useMapStore((s) => s.navigationState);
  const activeRoute = useMapStore((s) => s.activeRoute);

  if (navigationState !== 'navigating' || !activeRoute) return null;

  const nextStep = activeRoute.steps[0];
  const instruction = translateInstruction(nextStep?.instruction) || 'Tiếp tục đi thẳng';

  return (
    <div className="nav-header">
      <div className="nav-header__icon">
        {getManeuverIcon(nextStep?.maneuver.type)}
      </div>
      <div className="nav-header__info">
        <span className="nav-header__instruction">{instruction}</span>
        <span className="nav-header__distance">
          {formatStepDistance(nextStep?.distance ?? 0)}
        </span>
      </div>
    </div>
  );
}

function getManeuverIcon(type?: string): string {
  switch (type) {
    case 'turn-left':
    case 'turn-sharp-left':
      return '↰';
    case 'turn-right':
    case 'turn-sharp-right':
      return '↱';
    case 'turn-slight-left':
      return '↲';
    case 'turn-slight-right':
      return '↳';
    case 'uturn':
      return '⤺';
    case 'roundabout':
    case 'rotary':
      return '↻';
    case 'merge':
      return '⤙';
    case 'fork':
      return '⑂';
    case 'end of road':
      return '⊣';
    case 'arrive':
      return '⚑';
    case 'depart':
      return '▶';
    case 'continue':
      return '↑';
    case 'off ramp':
      return '↗';
    case 'on ramp':
      return '↗';
    default:
      return '↑';
  }
}

function formatStepDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)} m`;
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

const MAIN_PATTERNS: [RegExp, string][] = [
  // Depart
  [/^Drive (north|south|east|west|northeast|northwest|southeast|southwest)/i, 'Xuất phát về hướng $1'],
  [/^Head (north|south|east|west|northeast|northwest|southeast|southwest) on (.+)/i, 'Đi về hướng $1 trên $2'],
  [/^Head (north|south|east|west|northeast|northwest|southeast|southwest)/i, 'Đi về hướng $1'],

  // Continue
  [/^Continue straight onto (.+)/i, 'Tiếp tục đi thẳng vào $1'],
  [/^Continue straight/i, 'Tiếp tục đi thẳng'],
  [/^Continue onto (.+)/i, 'Tiếp tục vào $1'],
  [/^Continue on (.+)/i, 'Tiếp tục trên $1'],
  [/^Continue/i, 'Tiếp tục'],

  // Turn
  [/^Turn left onto (.+)/i, 'Rẽ trái vào $1'],
  [/^Turn right onto (.+)/i, 'Rẽ phải vào $1'],
  [/^Turn left/i, 'Rẽ trái'],
  [/^Turn right/i, 'Rẽ phải'],

  // Slight
  [/^Bear left onto (.+)/i, 'Đi chếch trái vào $1'],
  [/^Bear right onto (.+)/i, 'Đi chếch phải vào $1'],
  [/^Bear left/i, 'Đi chếch trái'],
  [/^Bear right/i, 'Đi chếch phải'],
  [/^Slight left onto (.+)/i, 'Đi chếch trái vào $1'],
  [/^Slight right onto (.+)/i, 'Đi chếch phải vào $1'],
  [/^Slight left/i, 'Đi chếch trái'],
  [/^Slight right/i, 'Đi chếch phải'],

  // Sharp
  [/^Sharp left onto (.+)/i, 'Rẽ gấp trái vào $1'],
  [/^Sharp right onto (.+)/i, 'Rẽ gấp phải vào $1'],
  [/^Sharp left/i, 'Rẽ gấp trái'],
  [/^Sharp right/i, 'Rẽ gấp phải'],

  // U-turn
  [/^Make a [Uu]-?turn/i, 'Quay đầu'],
  [/^U-?turn/i, 'Quay đầu'],

  // Keep
  [/^Keep left onto (.+)/i, 'Đi bên trái vào $1'],
  [/^Keep right onto (.+)/i, 'Đi bên phải vào $1'],
  [/^Keep left at .+ onto (.+)/i, 'Đi bên trái vào $1'],
  [/^Keep right at .+ onto (.+)/i, 'Đi bên phải vào $1'],
  [/^Keep left/i, 'Đi bên trái'],
  [/^Keep right/i, 'Đi bên phải'],

  // Roundabout
  [/^Enter the roundabout and take the (\d+)\w+ exit onto (.+)/i, 'Vào vòng xuyến, đi lối ra thứ $1 vào $2'],
  [/^Enter the roundabout and take the (\d+)\w+ exit/i, 'Vào vòng xuyến, đi lối ra thứ $1'],
  [/^At the roundabout.*?take the (\d+)\w+ exit onto (.+)/i, 'Tại vòng xuyến, đi lối ra thứ $1 vào $2'],
  [/^At the roundabout.*?take the (\d+)\w+ exit/i, 'Tại vòng xuyến, đi lối ra thứ $1'],
  [/^At the roundabout.*?exit (\d+)/i, 'Tại vòng xuyến, đi lối ra thứ $1'],
  [/^Enter the roundabout/i, 'Vào vòng xuyến'],
  [/^Take the (\d+)\w+ exit/i, 'Đi lối ra thứ $1'],

  // Merge / Ramp
  [/^Merge left onto (.+)/i, 'Nhập làn trái vào $1'],
  [/^Merge right onto (.+)/i, 'Nhập làn phải vào $1'],
  [/^Merge onto (.+)/i, 'Nhập vào $1'],
  [/^Merge/i, 'Nhập làn'],
  [/^Take the ramp on the left/i, 'Đi đường nhánh bên trái'],
  [/^Take the ramp on the right/i, 'Đi đường nhánh bên phải'],
  [/^Take the ramp/i, 'Đi theo đường nhánh'],

  // Exit
  [/^Take exit (\d+)/i, 'Đi lối ra $1'],
  [/^Take the (.+) exit/i, 'Đi lối ra $1'],

  // Arrive
  [/^You have arrived at your destination.*on the left/i, 'Bạn đã đến nơi, điểm đến ở bên trái'],
  [/^You have arrived at your destination.*on the right/i, 'Bạn đã đến nơi, điểm đến ở bên phải'],
  [/^You have arrived/i, 'Bạn đã đến nơi'],
  [/^Your destination is on the left/i, 'Điểm đến ở bên trái'],
  [/^Your destination is on the right/i, 'Điểm đến ở bên phải'],
  [/^Arrive/i, 'Đến nơi'],
];

/** compass map - apply after main pattern */
const COMPASS_MAP: [RegExp, string][] = [
  [/\bnortheast\b/gi, 'đông bắc'],
  [/\bnorthwest\b/gi, 'tây bắc'],
  [/\bsoutheast\b/gi, 'đông nam'],
  [/\bsouthwest\b/gi, 'tây nam'],
  [/\bnorth\b/gi, 'bắc'],
  [/\bsouth\b/gi, 'nam'],
  [/\beast\b/gi, 'đông'],
  [/\bwest\b/gi, 'tây'],
];

function translateInstruction(instruction?: string): string {
  if (!instruction) return '';
  let result = instruction;

  for (const [pattern, replacement] of MAIN_PATTERNS) {
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement);
      break;
    }
  }

  for (const [pattern, replacement] of COMPASS_MAP) {
    result = result.replace(pattern, replacement);
  }

  return result;
}
