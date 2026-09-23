import { useRef } from 'react'
import { useDesignStore } from '../../store/useDesignStore'
import { toast } from '../../store/useToastStore'
import {
  addText,
  addRect,
  addCircle,
  addLine,
  addImageFromFile,
  duplicateSelected,
  deleteSelected,
  editorActions,
} from '../../lib/fabricCanvas'
import {
  CursorIcon,
  TextIcon,
  ImageIcon,
  PenIcon,
  SquareIcon,
  CircleIcon,
  LineIcon,
  CopyIcon,
  TrashIcon,
  UndoIcon,
  RedoIcon,
} from '../icons'
import { Tooltip } from '../Tooltip'

interface ToolButtonProps {
  label: string
  tip?: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToolButton({ label, tip, active, disabled, onClick, children }: ToolButtonProps) {
  return (
    <Tooltip label={tip ?? label} side="right">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`tool-btn shrink-0 ${active ? 'tool-btn-active' : ''}`}
      >
        {children}
      </button>
    </Tooltip>
  )
}

export function Toolbar() {
  const tool = useDesignStore((s) => s.tool)
  const setTool = useDesignStore((s) => s.setTool)
  const canUndo = useDesignStore((s) => s.canUndo)
  const canRedo = useDesignStore((s) => s.canRedo)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    setTool('select')
    fileInputRef.current?.click()
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    try {
      await addImageFromFile(file)
      toast.success('Image added to your design')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add image.')
    }
  }

  return (
    <div className="panel flex flex-row flex-wrap items-center justify-center gap-1 p-2 lg:flex-col lg:flex-nowrap lg:justify-start">
      <ToolButton
        label="Select / Move"
        tip="Select & move — pick, resize, and rotate elements"
        active={tool === 'select'}
        onClick={() => setTool('select')}
      >
        <CursorIcon />
      </ToolButton>

      <ToolButton
        label="Add text"
        tip="Add text — drop in an editable text box"
        onClick={() => { setTool('select'); addText() }}
      >
        <TextIcon />
      </ToolButton>

      <ToolButton
        label="Upload image"
        tip="Upload image — add a PNG, JPG, or SVG to the design"
        onClick={handleUploadClick}
      >
        <ImageIcon />
      </ToolButton>

      <ToolButton
        label="Draw (pen)"
        tip="Pen — draw freehand on the shirt (click again to stop)"
        active={tool === 'pen'}
        onClick={() => setTool(tool === 'pen' ? 'select' : 'pen')}
      >
        <PenIcon />
      </ToolButton>

      <div className="mx-1 h-8 w-px shrink-0 bg-slate-200 lg:mx-0 lg:my-1 lg:h-px lg:w-8" />

      <ToolButton
        label="Add rectangle"
        tip="Add rectangle"
        onClick={() => { setTool('select'); addRect() }}
      >
        <SquareIcon />
      </ToolButton>
      <ToolButton
        label="Add circle"
        tip="Add circle"
        onClick={() => { setTool('select'); addCircle() }}
      >
        <CircleIcon />
      </ToolButton>
      <ToolButton
        label="Add line"
        tip="Add line"
        onClick={() => { setTool('select'); addLine() }}
      >
        <LineIcon />
      </ToolButton>

      <div className="mx-1 h-8 w-px shrink-0 bg-slate-200 lg:mx-0 lg:my-1 lg:h-px lg:w-8" />

      <ToolButton
        label="Duplicate"
        tip="Duplicate selection (⌘/Ctrl + D)"
        onClick={() => void duplicateSelected()}
      >
        <CopyIcon />
      </ToolButton>
      <ToolButton
        label="Delete"
        tip="Delete selection (Del)"
        onClick={() => deleteSelected()}
      >
        <TrashIcon />
      </ToolButton>

      <div className="mx-1 h-8 w-px shrink-0 bg-slate-200 lg:mx-0 lg:my-1 lg:h-px lg:w-8" />

      <ToolButton
        label="Undo"
        tip="Undo (⌘/Ctrl + Z)"
        disabled={!canUndo}
        onClick={() => editorActions.undo()}
      >
        <UndoIcon />
      </ToolButton>
      <ToolButton
        label="Redo"
        tip="Redo (⌘/Ctrl + Shift + Z)"
        disabled={!canRedo}
        onClick={() => editorActions.redo()}
      >
        <RedoIcon />
      </ToolButton>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
