import { useState, useEffect, useCallback } from "react"
import { Button } from "../button"
import { Modal } from "../modal"
import { LazyDiv } from "../lazyDiv"
import { PHOTO_SCRIPT_URL } from "../../env"
import "./index.scss"

type Photo = {
  fileId: string
  fileName: string
  timestamp: number
}

const readFileAsBase64 = (
  file: File,
): Promise<{ base64: string; fileName: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target!.result as string
      const [prefix, base64] = dataUrl.split(",")
      const mimeType = prefix.match(/:(.*?);/)?.[1] ?? file.type
      resolve({ base64, fileName: file.name, mimeType })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** 사진 업로드 완료 시 포토북 목록을 새로고침하도록 알리는 이벤트 */
const PHOTO_UPLOADED_EVENT = "photobook:photo-uploaded"

export const PhotoBook = () => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)

  const loadPhotos = useCallback(async () => {
    if (!PHOTO_SCRIPT_URL) return
    setLoading(true)
    try {
      const res = await fetch(`${PHOTO_SCRIPT_URL}?action=list`)
      const data = await res.json()
      if (data.success) setPhotos(data.photos)
    } catch (err) {
      console.error("Error loading photos:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  // 다른 곳(예: Information 섹션)에서 사진 업로드가 완료되면 목록을 새로고침합니다.
  useEffect(() => {
    window.addEventListener(PHOTO_UPLOADED_EVENT, loadPhotos)
    return () => window.removeEventListener(PHOTO_UPLOADED_EVENT, loadPhotos)
  }, [loadPhotos])

  return (
    <LazyDiv className="card photo-book">
      <h2 className="english">Photo Book</h2>
      <div className="description">결혼식에서 찍은 사진을 공유해주세요.</div>
      <div className="break" />

      {loading ? (
        <div className="status-text">불러오는 중...</div>
      ) : photos.length === 0 ? (
        <div className="status-text">아직 업로드된 사진이 없습니다.</div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.fileId} className="photo-item">
              <img
                src={`https://drive.google.com/thumbnail?id=${photo.fileId}&sz=w400`}
                alt={photo.fileName}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </LazyDiv>
  )
}

/**
 * 사진 업로드 버튼과 업로드 모달을 함께 제공하는 컴포넌트입니다.
 * 구글 로그인 없이 바로 사진을 선택하고 업로드할 수 있습니다.
 */
export const PhotoUploadButton = ({
  children = "사진 업로드하기",
  style,
}: {
  children?: React.ReactNode
  style?: React.CSSProperties
}) => {
  const uploadModalState = useState(false)

  if (!PHOTO_SCRIPT_URL) return null

  return (
    <>
      <Button style={style} onClick={() => uploadModalState[1](true)}>
        {children}
      </Button>

      <Modal
        modalState={uploadModalState}
        className="upload-photo-modal"
        closeOnClickBackground={false}
      >
        <UploadModal
          onSuccess={() => {
            uploadModalState[1](false)
            window.dispatchEvent(new Event(PHOTO_UPLOADED_EVENT))
          }}
          onClose={() => uploadModalState[1](false)}
        />
      </Modal>
    </>
  )
}

const UploadModal = ({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void
  onClose: () => void
}) => {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return alert("사진을 선택해주세요.")

    setLoading(true)
    try {
      const { base64, fileName, mimeType } = await readFileAsBase64(selectedFile)
      await fetch(PHOTO_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: "upload",
          fileData: base64,
          mimeType,
          fileName,
        }),
      })
      alert(
        "사진이 업로드 되었습니다.\n감사합니다.",
      )
      onSuccess()
    } catch (err) {
      console.error("[PhotoUpload] upload error:", err)
      alert(`업로드 실패: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="header">
        <div className="title-group">
          <div className="title">사진 업로드</div>
          <div className="subtitle">결혼식 사진을 공유해주세요.</div>
        </div>
      </div>
      <div className="content">
        {preview && (
          <img src={preview} alt="미리보기" className="preview-image" />
        )}
        <label className="file-label">
          {selectedFile ? selectedFile.name : "사진 선택하기"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={loading}
          />
        </label>
      </div>
      <div className="footer">
        <Button buttonStyle="style2" disabled={loading} type="submit">
          업로드하기
        </Button>
        <Button
          buttonStyle="style2"
          type="button"
          className="bg-light-grey-color text-dark-color"
          onClick={onClose}
          disabled={loading}
        >
          닫기
        </Button>
      </div>
    </form>
  )
}
