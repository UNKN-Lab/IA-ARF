import {ProductStatus} from "@prisma/client";

export enum PAGINATION{
	PER_PAGE = 200
}
export const MAX_FILE_SIZE = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function getStatusText(status: string){
	switch (status) {
		case ProductStatus.PUBLISHED:
			return 'Công Khai'
		case ProductStatus.DRAFT:
			return 'Nháp'
		case ProductStatus.ARCHIVED:
			return 'Lưu trữ'
		case ProductStatus.PENDING:
			return 'Chờ duyệt'
		case ProductStatus.OUT_OF_STOCK:
			return 'Hết hàng'
		default:
			return ''
	}
}
export const badgeCase = (status?: string) => {
	switch (status){
		case ProductStatus.PENDING:
		case ProductStatus.DRAFT:
			return "secondary"
		case ProductStatus.OUT_OF_STOCK:
			return "destructive"
		case ProductStatus.PUBLISHED:
			return 'default'
		default:
			return 'warning'
	}
}

export enum DEFAULT_PARAMS {
	AREA_NAME = 'Thành phố Lào Cai'
}

export function getRoleText(status: string){
	switch (status) {
		case 'ADMIN':
			return 'Admin'
		case 'CREATOR':
			return 'Quyền tạo'
		case 'MEMBER':
			return 'Nhân viên '
		case 'USER':
			return 'Người dùng'
		default:
			return ''
	}
}

